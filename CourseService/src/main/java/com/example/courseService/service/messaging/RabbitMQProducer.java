package com.example.courseService.service.messaging;

import com.example.courseService.config.RabbitMQConfig;

import com.example.courseService.event.CourseAvailableForEnrollmentEvent;
import com.example.courseService.event.CourseCreatedEvent;
import com.example.courseService.event.StudyStatisticsRequestEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class RabbitMQProducer {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public RabbitMQProducer(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Sends a synchronous request to retrieve instructor details.
     */
    public Object getInstructorDetails(List<UUID> instructorIds) {
        Map<String, Object> request = new HashMap<>();
        request.put("instructorIds", instructorIds);

        try {
            String message = objectMapper.writeValueAsString(request);
            return rabbitTemplate.convertSendAndReceive(
                    RabbitMQConfig.EXCHANGE_NAME, "request.instructorDetails", message);
        } catch (Exception e) {
            log.error("Failed to send instructor details request: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Publishes a CourseCreatedEvent to the corresponding queue.
     */
    public void publishCourseCreatedEvent(CourseCreatedEvent event) {
        try {
            String message = objectMapper.writeValueAsString(event);
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME, "event.courseCreated", message);
            log.info("Published CourseCreatedEvent: {}", message);
        } catch (Exception e) {
            log.error("Failed to publish CourseCreatedEvent: {}", e.getMessage(), e);
        }
    }

    /**
     * Publishes a CourseAvailableForEnrollmentEvent to the corresponding queue.
     */
    public void publishCourseAvailableForEnrollmentEvent(CourseAvailableForEnrollmentEvent event) {
        try {
            String message = objectMapper.writeValueAsString(event);
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME, "event.courseEnrollment", message);
            log.info("Published CourseAvailableForEnrollmentEvent: {}", message);
        } catch (Exception e) {
            log.error("Failed to publish CourseAvailableForEnrollmentEvent: {}", e.getMessage(), e);
        }
    }

    /**
     * Publishes a StudyStatisticsRequestEvent to collect unified statistics from all services.
     */
    public void publishStudyStatisticsRequest(StudyStatisticsRequestEvent event) {
        try {
            String message = objectMapper.writeValueAsString(event);
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.USER_EVENTS_EXCHANGE, "study.statistics.request", message);
            log.info("Published StudyStatisticsRequestEvent with ID: {}", event.getRequestId());
        } catch (Exception e) {
            log.error("Failed to publish StudyStatisticsRequestEvent: {}", e.getMessage(), e);
        }
    }
}