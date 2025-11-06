package com.example.kafka.coursera.events.consumers;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class SchoolDataResponseConsumer {
    
    private final ObjectMapper objectMapper;
    
    // Store aggregated data temporarily by school ID
    private final Map<UUID, Map<String, Object>> aggregatedData = new ConcurrentHashMap<>();
    private final Map<UUID, CountDownLatch> waitingRequests = new ConcurrentHashMap<>();
    
    @RabbitListener(queues = "school_data_response_queue")
    public void handleSchoolDataResponse(Map<String, Object> message) {
        try {
            String schoolIdStr = (String) message.get("schoolId");
            String serviceType = (String) message.get("serviceType");
            
            log.info("📨 Received school data response for schoolId: {} from service: {}", schoolIdStr, serviceType);
            log.debug("Response data: {}", objectMapper.writeValueAsString(message));
            
            if (schoolIdStr != null && serviceType != null) {
                UUID schoolId = UUID.fromString(schoolIdStr);
                
                // Store the response data
                aggregatedData.computeIfAbsent(schoolId, k -> new ConcurrentHashMap<>())
                    .put(serviceType, message);
                
                log.info("✅ Stored {} data for school {}", serviceType, schoolId);
                
                // Notify any waiting requests
                CountDownLatch latch = waitingRequests.get(schoolId);
                if (latch != null) {
                    latch.countDown();
                    log.info("🔔 Notified waiting request for school {}", schoolId);
                }
            }
        } catch (Exception e) {
            log.error("❌ Error processing school data response: {}", e.getMessage(), e);
        }
    }
    
    public Map<String, Object> getAggregatedData(UUID schoolId) {
        return aggregatedData.get(schoolId);
    }
    
    public void clearAggregatedData(UUID schoolId) {
        aggregatedData.remove(schoolId);
        waitingRequests.remove(schoolId);
    }
    
    public void waitForResponses(UUID schoolId, int timeoutSeconds, int expectedResponses) {
        try {
            CountDownLatch latch = new CountDownLatch(expectedResponses);
            waitingRequests.put(schoolId, latch);
            
            log.info("⏳ Waiting for {} responses for school {} (timeout: {}s)", expectedResponses, schoolId, timeoutSeconds);
            
            boolean completed = latch.await(timeoutSeconds, TimeUnit.SECONDS);
            if (!completed) {
                log.warn("⚠️ Timeout waiting for all responses for school {}", schoolId);
            } else {
                log.info("✅ Received all expected responses for school {}", schoolId);
            }
        } catch (InterruptedException e) {
            log.error("❌ Interrupted while waiting for responses for school {}", schoolId, e);
            Thread.currentThread().interrupt();
        }
    }
}