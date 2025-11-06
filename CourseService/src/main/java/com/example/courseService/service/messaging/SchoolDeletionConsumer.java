package com.example.courseService.service.messaging;

import com.example.courseService.config.RabbitMQConfig;
import com.example.courseService.service.CourseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchoolDeletionConsumer {
    private final CourseService courseService;
    private final RabbitTemplate rabbitTemplate;

    @RabbitListener(queues = RabbitMQConfig.SCHOOL_DELETED_QUEUE)
    public void handleSchoolDeletion(Map<String, Object> message) {
        try {
            log.info("Received school deletion event: {}", message);

            String eventType = (String) message.get("eventType");

            if (!"SCHOOL_DELETED".equals(eventType)) {
                log.warn("Unexpected event type: {}", eventType);
                return;
            }

            String schoolIdStr = (String) message.get("schoolId");

            if (schoolIdStr == null) {
                log.error("Received school deletion event without schoolId");
                return;
            }

            UUID schoolId = UUID.fromString(schoolIdStr);
            log.info("Processing school deletion validation for school: {}", schoolId);

            boolean hasCourses = courseService.hasCoursesForSchool(schoolId);

            if (hasCourses) {
                log.warn("School {} has courses - sending prevention response", schoolId);
                Map<String, Object> response = Map.of(
                        "schoolId", schoolId.toString(),
                        "canDelete", false,
                        "reason", "School has active courses that must be deleted first",
                        "service", "course-service");

                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.SCHOOL_EVENTS_EXCHANGE,
                        "school.deletion.prevented",
                        response);
                log.info("Sent prevention response for school: {}", schoolId);
            } else {
                log.info("School {} has no courses - sending approval response", schoolId);
                Map<String, Object> response = Map.of(
                        "schoolId", schoolId.toString(),
                        "canDelete", true,
                        "service", "course-service");

                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.SCHOOL_EVENTS_EXCHANGE,
                        "school.deletion.approved",
                        response);
                log.info("Sent approval response for school: {}", schoolId);
            }

        } catch (Exception e) {
            log.error("Error processing school deletion event: {}", e.getMessage(), e);

            String schoolId = (String) message.get("schoolId");
            Map<String, Object> errorResponse = Map.of(
                    "schoolId", schoolId != null ? schoolId : "unknown",
                    "canDelete", false,
                    "reason", "Error validating school deletion: " + e.getMessage(),
                    "service", "course-service");

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.SCHOOL_EVENTS_EXCHANGE,
                    "school.deletion.error",
                    errorResponse);
        }
    }
}
