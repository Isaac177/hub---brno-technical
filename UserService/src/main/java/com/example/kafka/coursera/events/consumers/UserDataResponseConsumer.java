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
public class UserDataResponseConsumer {

    private final ObjectMapper objectMapper;

    private final Map<UUID, Map<String, Object>> aggregatedData = new ConcurrentHashMap<>();
    private final Map<UUID, CountDownLatch> waitingRequests = new ConcurrentHashMap<>();

    @RabbitListener(queues = "user_data_response_queue")
    public void handleUserDataResponse(Map<String, Object> message) {
        try {
            String userIdStr = (String) message.get("userId");
            String serviceType = (String) message.get("serviceType");

            if (userIdStr != null && serviceType != null) {
                UUID userId = UUID.fromString(userIdStr);

                aggregatedData.computeIfAbsent(userId, k -> new ConcurrentHashMap<>())
                    .put(serviceType, message);

                CountDownLatch latch = waitingRequests.get(userId);
                if (latch != null) {
                    latch.countDown();
                }
            }
        } catch (Exception e) {
            log.error("❌ Error processing user data response: {}", e.getMessage(), e);
        }
    }

    public Map<String, Object> getAggregatedData(UUID userId) {
        return aggregatedData.get(userId);
    }

    public void clearAggregatedData(UUID userId) {
        aggregatedData.remove(userId);
        waitingRequests.remove(userId);
    }

    public void waitForResponses(UUID userId, int timeoutSeconds, int expectedResponses) {
        try {
            CountDownLatch latch = new CountDownLatch(expectedResponses);
            waitingRequests.put(userId, latch);

            boolean completed = latch.await(timeoutSeconds, TimeUnit.SECONDS);
            if (!completed) {
                log.warn("⚠️ Timeout waiting for all responses for user {}", userId);
            } else {
                log.info("✅ Received all expected responses for user {}", userId);
            }
        } catch (InterruptedException e) {
            log.error("❌ Interrupted while waiting for responses for user {}", userId, e);
            Thread.currentThread().interrupt();
        }
    }
}