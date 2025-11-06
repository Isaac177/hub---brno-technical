package com.example.kafka.coursera.events.emitters;

import com.example.kafka.coursera.DTO.StudyStatisticsResponseDTO;
import com.example.kafka.coursera.configs.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class StudyStatisticsEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishStudyStatisticsResponse(StudyStatisticsResponseDTO response) {
        try {
            String routingKey = "study.statistics.response.user." + response.getRequestId();
            
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.USER_EVENTS_EXCHANGE,
                    routingKey,
                    response
            );
            
            log.info("📊 Successfully published study statistics response for request: {} from UserService", 
                    response.getRequestId());
            
        } catch (Exception e) {
            log.error("❌ Failed to publish study statistics response for request: {} from UserService. Error: {}", 
                    response.getRequestId(), e.getMessage(), e);
        }
    }
}