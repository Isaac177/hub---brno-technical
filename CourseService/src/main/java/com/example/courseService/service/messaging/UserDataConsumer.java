package com.example.courseService.service.messaging;

import com.example.courseService.service.CourseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserDataConsumer {

    private final CourseService courseService;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    
    @Value("${student.service.api.url}")
    private String studentServiceUrl;

    @RabbitListener(queues = "user_data_request_queue")
    public void handleUserDataRequest(Map<String, Object> message) {
        try {
            String userIdStr = (String) message.get("userId");
            String eventType = (String) message.get("eventType");

            log.info("Received user data request for userId: {} with eventType: {}", userIdStr, eventType);

            if ("USER_DATA_REQUEST".equals(eventType) && userIdStr != null) {
                UUID userId = UUID.fromString(userIdStr);
                
                // Get courses taught by the user (if they are an instructor)
                List<Map<String, Object>> taughtCourses = courseService.getCoursesByInstructorIdWithDetails(userId);
                
                // Get enrollment data for courses the user is enrolled in
                List<Map<String, Object>> enrolledCourses = getEnrolledCourses(userId);
                
                // Calculate statistics
                int taughtCoursesCount = taughtCourses.size();
                int enrolledCoursesCount = enrolledCourses.size();
                
                // Calculate total enrollments for taught courses
                int totalEnrollmentsInTaughtCourses = taughtCourses.stream()
                    .mapToInt(course -> (Integer) course.getOrDefault("enrollmentCount", 0))
                    .sum();

                // Calculate average price of taught courses
                double averagePriceOfTaughtCourses = taughtCourses.stream()
                    .filter(course -> course.get("price") != null)
                    .mapToDouble(course -> ((Number) course.get("price")).doubleValue())
                    .average()
                    .orElse(0.0);

                // Prepare comprehensive response data
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("userId", userIdStr);
                responseData.put("serviceType", "COURSE_SERVICE");
                responseData.put("taughtCoursesCount", taughtCoursesCount);
                responseData.put("enrolledCoursesCount", enrolledCoursesCount);
                responseData.put("totalEnrollmentsInTaughtCourses", totalEnrollmentsInTaughtCourses);
                responseData.put("averagePriceOfTaughtCourses", Math.round(averagePriceOfTaughtCourses * 100.0) / 100.0);
                responseData.put("taughtCourses", taughtCourses);
                responseData.put("enrolledCourses", enrolledCourses);

                // Course statistics
                Map<String, Object> courseStats = new HashMap<>();
                courseStats.put("totalCourses", taughtCoursesCount + enrolledCoursesCount);
                courseStats.put("asInstructor", taughtCoursesCount);
                courseStats.put("asStudent", enrolledCoursesCount);
                responseData.put("courseStatistics", courseStats);

                // Publish response
                rabbitTemplate.convertAndSend(
                    "user_events",
                    "user.data.response.courses",
                    responseData
                );

                log.info("Published user data response for userId: {} with {} taught courses and {} enrolled courses",
                    userIdStr, taughtCoursesCount, enrolledCoursesCount);
            }
        } catch (Exception e) {
            log.error("Error processing user data request: {}", e.getMessage(), e);
        }
    }

    private List<Map<String, Object>> getEnrolledCourses(UUID userId) {
        try {
            log.info("Fetching enrollment data for user: {}", userId);
            
            // Call to student service to get enrollment data
            // This assumes there's a student service endpoint that returns enrollment data
            String enrollmentUrl = studentServiceUrl + "/api/enrollments/user/" + userId;
            
            // Make the REST call to get enrollment data
            Map<String, Object> enrollmentResponse = restTemplate.getForObject(enrollmentUrl, Map.class);
            
            if (enrollmentResponse != null && enrollmentResponse.containsKey("enrollments")) {
                List<Map<String, Object>> enrollments = (List<Map<String, Object>>) enrollmentResponse.get("enrollments");
                
                List<Map<String, Object>> enrolledCoursesData = new ArrayList<>();
                
                for (Map<String, Object> enrollment : enrollments) {
                    String courseIdStr = (String) enrollment.get("courseId");
                    if (courseIdStr != null) {
                        try {
                            UUID courseId = UUID.fromString(courseIdStr);
                            
                            // Get course details
                            var course = courseService.getCourseById(courseId);
                            if (course != null) {
                                Map<String, Object> courseData = new HashMap<>();
                                courseData.put("courseId", course.getId().toString());
                                courseData.put("title", course.getTitle());
                                courseData.put("description", course.getDescription());
                                courseData.put("price", course.getPrice());
                                courseData.put("enrolledAt", enrollment.get("enrolledAt"));
                                courseData.put("progress", enrollment.getOrDefault("progress", 0));
                                courseData.put("status", enrollment.getOrDefault("status", "ACTIVE"));
                                courseData.put("completedAt", enrollment.get("completedAt"));
                                
                                enrolledCoursesData.add(courseData);
                            }
                        } catch (Exception e) {
                            log.warn("Error processing enrollment for courseId {}: {}", courseIdStr, e.getMessage());
                        }
                    }
                }
                
                return enrolledCoursesData;
            }
        } catch (RestClientException e) {
            log.warn("Could not fetch enrollment data from student service for user {}: {}. Using empty list.", userId, e.getMessage());
        } catch (Exception e) {
            log.error("Error fetching enrolled courses for user {}: {}", userId, e.getMessage(), e);
        }
        
        // Return empty list if service call fails or no enrollments found
        return new ArrayList<>();
    }
}