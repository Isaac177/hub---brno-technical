package com.example.kafka.coursera.services.messaging;

import com.example.kafka.coursera.configs.RabbitMQConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class RabbitMQProducer {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public RabbitMQProducer(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    public Long getInstructorCourseCount(UUID instructorId) {
        log.info("InstructorId: {}", instructorId);
        Map<String, Object> request = new HashMap<>();
        request.put("instructorIds", instructorId);

        try {
            String message = objectMapper.writeValueAsString(request);
            return (Long) rabbitTemplate.convertSendAndReceive(
                    RabbitMQConfig.EXCHANGE_NAME, "request.instructorCount", message);
        } catch (Exception e) {
            log.error("Error getting instructor course count: {}", e.getMessage(), e);
            return null;
        }
    }

    public void publishUserDataResponse(Map<String, Object> responseData) {
        try {
            log.info("📤 Publishing user data response for requestId: {}", responseData.get("requestId"));
            
            String message = objectMapper.writeValueAsString(responseData);
            
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.USER_EVENTS_EXCHANGE, 
                    "user.data.response", 
                    message
            );
            
            log.info("✅ Successfully published user data response for requestId: {}", responseData.get("requestId"));
            
        } catch (Exception e) {
            log.error("❌ Failed to publish user data response: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to publish user data response", e);
        }
    }
}