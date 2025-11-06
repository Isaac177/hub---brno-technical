package com.example.kafka.coursera.services.messaging;

import com.amazonaws.services.cognitoidp.model.ResourceNotFoundException;
import com.example.kafka.coursera.DTO.QuizCompletionMessage;
import com.example.kafka.coursera.configs.RabbitMQConfig;
import com.example.kafka.coursera.db.entities.Instructor;
import com.example.kafka.coursera.event.CourseCreatedEvent;
import com.example.kafka.coursera.services.achievements.UserAchievementService;
import com.example.kafka.coursera.services.InstructorService;
import com.example.kafka.coursera.services.UserStatisticsService;
import com.example.kafka.coursera.services.UserService;
import com.example.kafka.coursera.event.StudyStatisticsRequestEvent;
import com.example.kafka.coursera.DTO.StudyStatisticsResponseDTO;
import com.example.kafka.coursera.DTO.UserDTO;
import com.example.kafka.coursera.events.emitters.StudyStatisticsEventPublisher;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class RabbitMQConsumer {

    private final InstructorService instructorService;
    private final UserAchievementService userAchievementService;
    private final UserStatisticsService userStatisticsService;
    private final UserService userService;
    private final StudyStatisticsEventPublisher studyStatisticsEventPublisher;
    private final RabbitMQProducer rabbitMQProducer;
    private final ObjectMapper objectMapper;

    @Autowired
    public RabbitMQConsumer(InstructorService instructorService,
                           UserAchievementService userAchievementService,
                           UserStatisticsService userStatisticsService,
                           UserService userService,
                           StudyStatisticsEventPublisher studyStatisticsEventPublisher,
                           RabbitMQProducer rabbitMQProducer,
                           ObjectMapper objectMapper) {
        this.instructorService = instructorService;
        this.userAchievementService = userAchievementService;
        this.userStatisticsService = userStatisticsService;
        this.userService = userService;
        this.studyStatisticsEventPublisher = studyStatisticsEventPublisher;
        this.rabbitMQProducer = rabbitMQProducer;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = RabbitMQConfig.INSTRUCTOR_DETAILS_QUEUE)
    public Object handleInstructorCountRequest(String message) {
        try {
            log.debug("Received instructor details request: {}", message);
            @SuppressWarnings("unchecked")
            Map<String, Object> request = objectMapper.readValue(message, Map.class);
            @SuppressWarnings("unchecked")
            List<UUID> instructorIds = (List<UUID>) request.get("instructorIds");

            Object instructors = instructorService.getInstructorsByIdList(instructorIds);
            log.debug("Returning instructor details: {}", instructors);
            return instructors;
        } catch (Exception e) {
            log.error("Error while processing instructor details request: {}", message, e);
            return null;
        }
    }

    @RabbitListener(queues = RabbitMQConfig.COURSE_CREATED_QUEUE)
    @Transactional
    public void handleCourseCreatedEvent(String message) throws Exception {
        try {
            log.debug("Received course created event: {}", message);
            CourseCreatedEvent event = objectMapper.readValue(message, CourseCreatedEvent.class);
            log.info("Parsed CourseCreatedEvent: {}", event);

            if (event.getInstructorId() == null) {
                log.error("Instructor ID is null in course created event: {}", event);
                return;
            }

            Instructor instructor = new Instructor();
            instructor.setId(event.getInstructorId());
            instructor.setFirstName(event.getInstructorName());
            instructor.setEmail(event.getInstructorEmail());

            instructorService.saveInstructor(instructor);
            log.info("Instructor saved successfully: {}", instructor.getId());
        } catch (Exception e) {
            log.error("Error while processing course created event: {}", message, e);
            throw e;
        }
    }

    @RabbitListener(queues = RabbitMQConfig.QUIZ_COMPLETION_QUEUE)
    @Transactional
    public void handleQuizCompletion(Message message) throws Exception {
        log.info("=== Received Quiz Completion Message ===");
        log.debug("Message properties: {}", message.getMessageProperties());
        String messageBody = new String(message.getBody(), StandardCharsets.UTF_8);
        log.info("Raw message: {}", messageBody);

        try {
            QuizCompletionMessage quizMessage = objectMapper.readValue(messageBody, QuizCompletionMessage.class);
            log.info("Deserialized message: {}", quizMessage);

            if (quizMessage.getUserId() == null) {
                log.error("User ID is null in quiz completion message: {}", quizMessage);
                return;
            }

            log.info("Starting quiz completion processing for user: {}", quizMessage.getUserId());
            userAchievementService.handleQuizCompletion(quizMessage);
            log.info("=== Quiz completion processed successfully for user: {} ===", quizMessage.getUserId());
        } catch (Exception e) {
            log.error("Failed to process quiz completion message. Raw message: {}, Error: {}", messageBody, e.getMessage(), e);
            throw e;
        }
    }

    @RabbitListener(queues = RabbitMQConfig.USER_ACHIEVEMENTS_QUEUE)
    public void handleUserAchievement(Message message) {
        try {
            String messageBody = new String(message.getBody(), StandardCharsets.UTF_8);
            log.info("Received user achievement message: {}", messageBody);

            @SuppressWarnings("unchecked")
            Map<String, Object> achievementMessage = objectMapper.readValue(messageBody, Map.class);

            String type = (String) achievementMessage.get("type");
            if ("COURSE_ENROLLMENT".equals(type)) {
                userAchievementService.handleCourseEnrollment(achievementMessage);
            } else {
                log.warn("Unknown achievement type received: {}", type);
            }
        } catch (ResourceNotFoundException e) {
            // Log the error but don't rethrow - this is expected when user doesn't exist
            log.warn("User not found for achievement: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Error processing user achievement message: {}", e.getMessage(), e);
            // Rethrow to trigger RabbitMQ retry mechanism
            throw new AmqpRejectAndDontRequeueException("Failed to process achievement message", e);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.STUDY_STATISTICS_REQUEST_QUEUE)
    @Transactional
    public void handleStudyStatisticsRequest(String message) throws JsonProcessingException, JsonMappingException {
        log.info("📊 Received study statistics request in UserService");
        
        try {
            StudyStatisticsRequestEvent request = objectMapper.readValue(message, StudyStatisticsRequestEvent.class);
            log.info("Processing study statistics request with ID: {}", request.getRequestId());
            
            // Collect user statistics
            Map<String, Object> userStatistics = userStatisticsService.collectUserStatistics();
            
            // Create response
            StudyStatisticsResponseDTO response = StudyStatisticsResponseDTO.success(
                    request.getRequestId(), 
                    userStatistics
            );
            
            // Publish response
            studyStatisticsEventPublisher.publishStudyStatisticsResponse(response);
            
            log.info("✅ Successfully processed study statistics request: {}", request.getRequestId());
            
        } catch (Exception e) {
            log.error("❌ Failed to process study statistics request: {}", e.getMessage(), e);
            
            try {
                // Try to parse the request to get the ID for error response
                StudyStatisticsRequestEvent request = objectMapper.readValue(message, StudyStatisticsRequestEvent.class);
                StudyStatisticsResponseDTO errorResponse = StudyStatisticsResponseDTO.error(
                        request.getRequestId(), 
                        "UserService error: " + e.getMessage()
                );
                studyStatisticsEventPublisher.publishStudyStatisticsResponse(errorResponse);
            } catch (JsonProcessingException parseError) {
                log.error("Failed to parse message for error response: {}", parseError.getMessage(), parseError);
            } catch (Exception parseError) {
                log.error("Failed to send error response: {}", parseError.getMessage(), parseError);
            }
            
            throw e;
        }
    }

    @RabbitListener(queues = RabbitMQConfig.USER_DATA_REQUEST_QUEUE)
    @Transactional
    public void handleUserDataRequest(String message) throws JsonProcessingException {
        log.info("👥 Received user data request in UserService");
        
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> request = objectMapper.readValue(message, Map.class);
            
            String requestId = (String) request.get("requestId");
            @SuppressWarnings("unchecked")
            List<String> userEmails = (List<String>) request.get("userEmails");
            String requesterService = (String) request.get("requesterService");
            
            log.info("Processing user data request: requestId={}, emails count={}, requester={}", 
                requestId, userEmails.size(), requesterService);
            
            // Fetch user data
            List<UserDTO> users = userService.findByEmails(userEmails);
            log.info("Found {} users out of {} requested emails", users.size(), userEmails.size());
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("requestId", requestId);
            response.put("requesterService", requesterService);
            response.put("success", true);
            response.put("timestamp", java.time.Instant.now().toString());
            response.put("userData", users);
            
            // Publish response back to the requester
            rabbitMQProducer.publishUserDataResponse(response);
            
            log.info("✅ Successfully processed user data request: {} with {} users", requestId, users.size());
            
        } catch (Exception e) {
            log.error("❌ Failed to process user data request: {}", e.getMessage(), e);
            
            try {
                // Send error response
                @SuppressWarnings("unchecked")
                Map<String, Object> request = objectMapper.readValue(message, Map.class);
                
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("requestId", request.get("requestId"));
                errorResponse.put("requesterService", request.get("requesterService"));
                errorResponse.put("success", false);
                errorResponse.put("timestamp", java.time.Instant.now().toString());
                errorResponse.put("error", "UserService error: " + e.getMessage());
                errorResponse.put("userData", new ArrayList<>());
                
                rabbitMQProducer.publishUserDataResponse(errorResponse);
                
            } catch (Exception publishError) {
                log.error("Failed to send error response: {}", publishError.getMessage(), publishError);
            }
            
            throw e;
        }
    }
}