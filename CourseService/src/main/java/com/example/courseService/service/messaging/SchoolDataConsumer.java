package com.example.courseService.service.messaging;

import com.example.courseService.service.CourseService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class SchoolDataConsumer {

    private final CourseService courseService;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = "school_data_request_queue")
    public void handleSchoolDataRequest(Map<String, Object> message) {
        try {
            String schoolIdStr = (String) message.get("schoolId");
            String eventType = (String) message.get("eventType");

            log.info("Received school data request for schoolId: {} with eventType: {}", schoolIdStr, eventType);

            if ("SCHOOL_DATA_REQUEST".equals(eventType) && schoolIdStr != null) {
                UUID schoolId = UUID.fromString(schoolIdStr);
                
                // Get school-related course data with enhanced details
                List<Map<String, Object>> schoolCourses = courseService.getCoursesBySchoolIdWithDetails(schoolId);
                int courseCount = schoolCourses.size();

                // Calculate total enrollments across all courses
                int totalEnrollments = schoolCourses.stream()
                    .mapToInt(course -> (Integer) course.getOrDefault("enrollmentCount", 0))
                    .sum();

                // Calculate average price
                double averagePrice = schoolCourses.stream()
                    .filter(course -> course.get("price") != null)
                    .mapToDouble(course -> ((Number) course.get("price")).doubleValue())
                    .average()
                    .orElse(0.0);

                // Prepare comprehensive response data
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("schoolId", schoolIdStr);
                responseData.put("serviceType", "COURSE_SERVICE");
                responseData.put("courseCount", courseCount);
                responseData.put("totalEnrollments", totalEnrollments);
                responseData.put("averagePrice", Math.round(averagePrice * 100.0) / 100.0);
                responseData.put("courses", schoolCourses);

                // Publish response
                rabbitTemplate.convertAndSend(
                    "school_events",
                    "school.data.response.courses",
                    responseData
                );

                log.info("Published school data response for schoolId: {} with {} courses and {} total enrollments",
                    schoolIdStr, courseCount, totalEnrollments);
            }
        } catch (Exception e) {
            log.error("Error processing school data request: {}", e.getMessage(), e);
        }
    }
}