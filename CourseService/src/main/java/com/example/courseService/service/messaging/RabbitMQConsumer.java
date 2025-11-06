package com.example.courseService.service.messaging;

import com.example.courseService.config.RabbitMQConfig;
import com.example.courseService.dto.QuizResultDTO;
import com.example.courseService.service.CourseService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class RabbitMQConsumer {

    private final CourseService courseService;
    private final ObjectMapper objectMapper;

    public RabbitMQConsumer(CourseService courseService, ObjectMapper objectMapper) {
        this.courseService = courseService;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = RabbitMQConfig.INSTRUCTOR_COUNT_QUEUE)
    public Long handleInstructorCountRequest(String message) {
        try {
            Map<String, String> request = objectMapper.readValue(message, new TypeReference<Map<String, String>>() {});
            UUID instructorId = UUID.fromString(request.get("instructorId"));
            log.info("Instructor Id: {}", instructorId);
            return courseService.countCoursesByInstructorId(instructorId);
        } catch (Exception e) {
            log.error("Error processing instructor count request", e);
            return null;
        }
    }

    @RabbitListener(queues = RabbitMQConfig.QUIZ_RESULT_QUEUE)
    public void handleQuizResult(QuizResultDTO result) {
        try {
            if (result == null) {
                log.error("Received null quiz result");
                return;
            }
            
            log.info("Received quiz result for user: {}, quiz: {}, score: {}, passed: {}", 
                    result.getUserEmail(), result.getQuizId(), result.getScore(), result.isPassed());
            
            // Additional processing if needed
            
        } catch (Exception e) {
            log.error("Error processing quiz result: {}", e.getMessage(), e);
            // Don't rethrow - we don't want to requeue the message
        }
    }
}