package com.example.kafka.coursera.events.consumers;

import com.example.kafka.coursera.services.DeletionTrackingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Component
@RequiredArgsConstructor
public class SchoolDeletionResponseConsumer {

    private final DeletionTrackingService deletionTrackingService;

    private final Map<UUID, ValidationTracker> pendingDeletions = new ConcurrentHashMap<>();

    private static final int EXPECTED_VALIDATION_SERVICES = 1;

    @RabbitListener(queues = "school_deletion_response_queue")
    public void handleDeletionResponse(Map<String, Object> message) {
        try {
            log.info("=== RECEIVED DELETION RESPONSE MESSAGE ===");
            log.info("Raw message received: {}", message);
            log.info("Message keys: {}", message.keySet());
            log.info("Message values: {}", message.values());

            log.info("=== RECEIVED DELETION RESPONSE ===");
            log.info("Message: {}", message);

            String schoolIdStr = (String) message.get("schoolId");
            Boolean canDelete = (Boolean) message.get("canDelete");
            String service = (String) message.get("service");
            String reason = (String) message.get("reason");

            if (schoolIdStr == null) {
                log.error("Received deletion response without schoolId");
                return;
            }

            UUID schoolId = UUID.fromString(schoolIdStr);
            log.info("Received deletion response for school {}: canDelete={}, service={}, reason={}",
                    schoolId, canDelete, service, reason);

            // Check if this school is still being tracked
            if (!deletionTrackingService.isPendingDeletion(schoolId)) {
                log.warn("Received response for school {} that is no longer being tracked (possibly already processed)",
                        schoolId);
                return;
            }

            ValidationTracker tracker = pendingDeletions.computeIfAbsent(schoolId,
                    k -> new ValidationTracker(EXPECTED_VALIDATION_SERVICES));

            tracker.addResponse(service, canDelete != null ? canDelete : false, reason);
            log.info("Added response from service: {}, total responses: {}", service, tracker.receivedResponses.get());

            if (tracker.hasAllResponses()) {
                log.info("All responses received for school: {}", schoolId);
                processFinalDeletionDecision(schoolId, tracker);
                pendingDeletions.remove(schoolId);
            } else {
                log.info("Still waiting for more responses for school: {}", schoolId);
            }

        } catch (Exception e) {
            log.error("Error processing deletion response: {}", e.getMessage(), e);
        }
    }

    private void processFinalDeletionDecision(UUID schoolId, ValidationTracker tracker) {
        if (tracker.canProceedWithDeletion()) {
            log.info("All services approved deletion for school: {}", schoolId);
            deletionTrackingService.setValidationResult(schoolId, true, null);
        } else {
            log.warn("School deletion PREVENTED for school {}: {}", schoolId, tracker.getRejectionReasons());
            deletionTrackingService.setValidationResult(schoolId, false, tracker.getRejectionReasons());
        }
    }

    private static class ValidationTracker {
        private final int expectedResponses;
        private final AtomicInteger receivedResponses = new AtomicInteger(0);
        private final Map<String, Boolean> serviceResponses = new ConcurrentHashMap<>();
        private final Map<String, String> rejectionReasons = new ConcurrentHashMap<>();

        public ValidationTracker(int expectedResponses) {
            this.expectedResponses = expectedResponses;
        }

        public void addResponse(String service, Boolean canDelete, String reason) {
            serviceResponses.put(service, canDelete);
            if (!canDelete && reason != null) {
                rejectionReasons.put(service, reason);
            }
            receivedResponses.incrementAndGet();
        }

        public boolean hasAllResponses() {
            return receivedResponses.get() >= expectedResponses;
        }

        public boolean canProceedWithDeletion() {
            return serviceResponses.values().stream().allMatch(Boolean::booleanValue);
        }

        public String getRejectionReasons() {
            return String.join("; ", rejectionReasons.values());
        }
    }
}
