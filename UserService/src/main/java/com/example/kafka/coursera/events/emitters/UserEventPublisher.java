package com.example.kafka.coursera.events.emitters;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import com.example.kafka.coursera.configs.RabbitMQConfig;

import java.util.UUID;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventPublisher {
    private final RabbitTemplate rabbitTemplate;

    public void publishUserDataRequest(UUID userId) {
        Map<String, String> message = Map.of(
            "userId", userId.toString(),
            "eventType", "USER_DATA_REQUEST"
        );

        try {
            log.info("📡 Publishing user data request for user: {} to exchange: {} with routing key: user.data.request", 
                userId, RabbitMQConfig.USER_EVENTS_EXCHANGE);
            
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.USER_EVENTS_EXCHANGE,
                "user.data.request",
                message
            );
            
            log.info("✅ Successfully published user data request for user: {}", userId);
        } catch (Exception e) {
            log.error("❌ Failed to publish user data request for user: {}", userId, e);
        }
    }
}