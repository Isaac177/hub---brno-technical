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
public class SchoolEventPublisher {
    private final RabbitTemplate rabbitTemplate;

    public void publishSchoolDeletion(UUID schoolId) {
        Map<String, String> message = Map.of(
            "schoolId", schoolId.toString(),
            "eventType", "SCHOOL_DELETED"
        );

        rabbitTemplate.convertAndSend(
            RabbitMQConfig.SCHOOL_EVENTS_EXCHANGE,
            "school.deleted",
            message
        );
    }

    public void publishSchoolDataRequest(UUID schoolId) {
        Map<String, String> message = Map.of(
            "schoolId", schoolId.toString(),
            "eventType", "SCHOOL_DATA_REQUEST"
        );

        try {
            log.info("📡 Publishing school data request for school: {} to exchange: {} with routing key: school.data.request", 
                schoolId, RabbitMQConfig.SCHOOL_EVENTS_EXCHANGE);
            
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.SCHOOL_EVENTS_EXCHANGE,
                "school.data.request",
                message
            );
            
            log.info("✅ Successfully published school data request for school: {}", schoolId);
        } catch (Exception e) {
            log.error("❌ Failed to publish school data request for school: {}", schoolId, e);
        }
    }
}
