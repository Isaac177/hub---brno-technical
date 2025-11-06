package com.example.kafka.coursera.events.consumers;

import com.example.kafka.coursera.configs.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;

@Component
@RequiredArgsConstructor
@Slf4j
public class StudentDataResponseConsumer {
    
    private final Map<UUID, Map<String, Object>> aggregatedStudentData = new ConcurrentHashMap<>();
    private final Map<UUID, CountDownLatch> waitingRequests = new ConcurrentHashMap<>();

    @RabbitListener(queues = RabbitMQConfig.STUDENT_DATA_RESPONSE_QUEUE)
    public void handleStudentDataResponse(Map<String, Object> message) {
        log.info("Received student data response: {}", message);
        
        String studentIdStr = (String) message.get("studentId");
        String serviceType = (String) message.get("serviceType");
        
        if (studentIdStr != null && serviceType != null) {
            try {
                UUID studentId = UUID.fromString(studentIdStr);
                
                // Store the response data
                aggregatedStudentData.computeIfAbsent(studentId, k -> new ConcurrentHashMap<>())
                    .put(serviceType, message);
                
                // Notify any waiting requests
                CountDownLatch latch = waitingRequests.get(studentId);
                if (latch != null) {
                    latch.countDown();
                }
                
                log.info("Processed student data response for student: {} from service: {}", studentId, serviceType);
            } catch (IllegalArgumentException e) {
                log.error("Invalid student ID format: {}", studentIdStr, e);
            }
        } else {
            log.warn("Received student data response with missing studentId or serviceType");
        }
    }

    public Map<String, Object> getAggregatedStudentData(UUID studentId) {
        return aggregatedStudentData.get(studentId);
    }

    public void waitForStudentDataResponse(UUID studentId, int expectedResponses, long timeoutMs) 
            throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(expectedResponses);
        waitingRequests.put(studentId, latch);
        
        try {
            latch.await(timeoutMs, java.util.concurrent.TimeUnit.MILLISECONDS);
        } finally {
            waitingRequests.remove(studentId);
        }
    }

    public void clearStudentData(UUID studentId) {
        aggregatedStudentData.remove(studentId);
    }
}