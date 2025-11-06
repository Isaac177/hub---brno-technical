package com.example.courseService.service.messaging;

import com.example.courseService.config.RabbitMQConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class StudyStatisticsResponseListener {

    private final ObjectMapper objectMapper;
    private final Map<UUID, CompletableFuture<Map<String, Object>>> userStatsPendingRequests = new ConcurrentHashMap<>();
    private final Map<UUID, CompletableFuture<Map<String, Object>>> enrollmentStatsPendingRequests = new ConcurrentHashMap<>();

    public StudyStatisticsResponseListener(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = RabbitMQConfig.STUDY_STATISTICS_RESPONSE_QUEUE)
    public void handleStudyStatisticsResponse(String message) {
        try {
            log.info("📨 Received study statistics response: {}", message);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = objectMapper.readValue(message, Map.class);
            
            String requestIdStr = (String) response.get("requestId");
            String service = (String) response.get("service");
            
            if (requestIdStr != null) {
                UUID requestId = UUID.fromString(requestIdStr);
                @SuppressWarnings("unchecked")
                Map<String, Object> statistics = (Map<String, Object>) response.get("statistics");
                
                if ("UserService".equals(service)) {
                    CompletableFuture<Map<String, Object>> future = userStatsPendingRequests.remove(requestId);
                    if (future != null) {
                        future.complete(statistics != null ? statistics : Map.of());
                        log.info("✅ Completed UserService statistics request: {}", requestId);
                    }
                } else if ("StudentManagementService".equals(service)) {
                    CompletableFuture<Map<String, Object>> future = enrollmentStatsPendingRequests.remove(requestId);
                    if (future != null) {
                        future.complete(statistics != null ? statistics : Map.of());
                        log.info("✅ Completed StudentManagementService statistics request: {}", requestId);
                    }
                }
            }
        } catch (Exception e) {
            log.error("❌ Error processing study statistics response: {}", e.getMessage(), e);
        }
    }

    public CompletableFuture<Map<String, Object>> waitForUserStatistics(UUID requestId) {
        CompletableFuture<Map<String, Object>> future = new CompletableFuture<>();
        userStatsPendingRequests.put(requestId, future);
        
        // Set timeout to prevent hanging forever
        future.orTimeout(10, java.util.concurrent.TimeUnit.SECONDS)
                .exceptionally(throwable -> {
                    log.warn("⏰ Timeout waiting for UserService statistics: {}", requestId);
                    userStatsPendingRequests.remove(requestId);
                    return Map.of("error", "UserService response timeout");
                });
        
        return future;
    }

    public CompletableFuture<Map<String, Object>> waitForEnrollmentStatistics(UUID requestId) {
        CompletableFuture<Map<String, Object>> future = new CompletableFuture<>();
        enrollmentStatsPendingRequests.put(requestId, future);
        
        // Set timeout to prevent hanging forever
        future.orTimeout(10, java.util.concurrent.TimeUnit.SECONDS)
                .exceptionally(throwable -> {
                    log.warn("⏰ Timeout waiting for StudentManagementService statistics: {}", requestId);
                    enrollmentStatsPendingRequests.remove(requestId);
                    return Map.of("error", "StudentManagementService response timeout");
                });
        
        return future;
    }
}