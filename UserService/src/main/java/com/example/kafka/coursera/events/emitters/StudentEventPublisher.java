package com.example.kafka.coursera.events.emitters;

import com.example.kafka.coursera.configs.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class StudentEventPublisher {
    private final RabbitTemplate rabbitTemplate;

    public void publishStudentDataRequest(List<UUID> studentIds) {
        Map<String, Object> message = Map.of(
            "studentIds", studentIds,
            "eventType", "STUDENT_DATA_REQUEST"
        );
        
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.STUDENT_EVENTS_EXCHANGE,
            "student.data.request",
            message
        );
    }

    public void publishSingleStudentDataRequest(UUID studentId) {
        Map<String, Object> message = Map.of(
            "studentId", studentId.toString(),
            "eventType", "SINGLE_STUDENT_DATA_REQUEST"
        );
        
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.STUDENT_EVENTS_EXCHANGE,
            "student.data.request",
            message
        );
    }
}