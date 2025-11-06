package com.example.courseService.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.HashMap;
import java.util.stream.Collectors;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.amazonaws.services.amplify.model.BadRequestException;
import com.example.courseService.config.RabbitMQConfig;
import com.example.courseService.dto.QuestionResultDTO;
import com.example.courseService.dto.QuizAnswerDTO;
import com.example.courseService.dto.QuizResultDTO;
import com.example.courseService.dto.QuizSubmissionDTO;
import com.example.courseService.model.Quiz;
import com.example.courseService.model.QuizQuestion;
import com.example.courseService.repository.QuizQuestionRepository;
import com.example.courseService.repository.QuizRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;

import com.example.courseService.service.QuizResultService;
import com.example.courseService.service.QuizProgressService;

import java.util.Arrays;
import java.time.Duration;

@Service
@Slf4j
public class QuizSubmissionService {
    private final RabbitTemplate rabbitTemplate;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizResultService quizResultService;
    private final QuizProgressService quizProgressService;

    @Autowired
    public QuizSubmissionService(
            RabbitTemplate rabbitTemplate,
            QuizRepository quizRepository,
            QuizQuestionRepository quizQuestionRepository,
            QuizResultService quizResultService,
            QuizProgressService quizProgressService) {
        this.rabbitTemplate = rabbitTemplate;
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.quizResultService = quizResultService;
        this.quizProgressService = quizProgressService;
    }
    
    @RabbitListener(queues = RabbitMQConfig.QUIZ_SUBMISSION_QUEUE)
    public void handleQuizSubmission(QuizSubmissionDTO submission) {
        try {
            log.info("Processing quiz submission for user: {}, quiz: {}", 
                    submission.getUserEmail(), submission.getQuizId());
            
            // 1. Calculate quiz results
            QuizResultDTO result = calculateQuizResult(submission);
            result.setSubmissionId(submission.getId());
            
            // Store result in Redis using submission ID as key
            log.info("Storing quiz result in Redis with key: quiz_result:{}", submission.getId());
            try {
                quizResultService.storeQuizResult(submission.getId().toString(), result);
                log.info("Successfully stored result in Redis");
            } catch (Exception e) {
                log.error("Error storing quiz result in Redis: {}", e.getMessage());
                throw e;
            }
            
            // 2. Send result back to client through RabbitMQ
            String routingKey = "event.quizResult";
            try {
                log.info("Publishing quiz result to RabbitMQ - Exchange: {}, Routing Key: {}", 
                        RabbitMQConfig.EXCHANGE_NAME, routingKey);
                
                rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, routingKey, result, message -> {
                    message.getMessageProperties().setContentType("application/json");
                    message.getMessageProperties().setContentEncoding("UTF-8");
                    message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                    return message;
                });
                
                log.info("Successfully published quiz result to RabbitMQ");

                // 3. Send quiz completion messages
                Quiz quiz = quizRepository.findById(submission.getQuizId())
                    .orElseThrow(() -> new EntityNotFoundException("Quiz not found"));
                
                // Calculate firstAttempt and perfectScore
                boolean firstAttempt = result.getAttemptNumber() == 1;
                boolean perfectScore = result.getScore() == result.getTotalPossibleScore();
                
                int totalQuizzes = quizProgressService.getTotalQuizzesInCourse(quiz.getCourseId());
                int completedQuizzes = quizProgressService.getCompletedQuizzesByUser(quiz.getCourseId(), submission.getUserEmail());
                double progress = quizProgressService.getProgress(quiz.getCourseId(), submission.getUserEmail());
                
                sendQuizCompletionMessages(result, submission, quiz, totalQuizzes, completedQuizzes, progress, firstAttempt, perfectScore);
            } catch (Exception e) {
                log.error("Failed to publish quiz result to RabbitMQ: {}", e.getMessage());
                throw e;
            }
            
            log.info("Quiz submission processed successfully. Score: {}, Passed: {}", 
                    result.getScore(), result.isPassed());
        } catch (Exception e) {
            log.error("Error processing quiz submission: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @SuppressWarnings("unlikely-arg-type")
    private QuizResultDTO calculateQuizResult(QuizSubmissionDTO submission) {
        Quiz quiz = quizRepository.findById(submission.getQuizId())
                .orElseThrow(() -> new EntityNotFoundException("Quiz not found"));
        
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizId(quiz.getId());
        if (questions.isEmpty()) {
            throw new EntityNotFoundException("No questions found for quiz");
        }

        int attemptNumber = getPreviousAttemptsCount(submission.getQuizId(), submission.getUserEmail()) + 1;
        log.info("Starting quiz grading for user: {}, Attempt #{}", submission.getUserEmail(), attemptNumber);
        log.info("Quiz details - Title: {}, Total Questions: {}", quiz.getTitle(), questions.size());
        
        List<QuestionResultDTO> questionResults = new ArrayList<>();
        int totalScore = 0;
        int totalPossiblePoints = 0;
        
        validateAnswers(submission.getAnswers(), questions);
        
        for (QuizAnswerDTO answer : submission.getAnswers()) {
            QuizQuestion question = questions.stream()
                    .filter(q -> q.getId().equals(answer.getQuestionId()))
                    .findFirst()
                    .orElseThrow(() -> new EntityNotFoundException("Question not found: " + answer.getQuestionId()));
            
            totalPossiblePoints += question.getPoints();
            
            boolean isCorrect;
            if ("CODE".equals(question.getType())) {
                isCorrect = question.getCorrectAnswer().equals(answer.getAnswer());
            } else if ("SHORT_ANSWER".equals(question.getType())) {
                isCorrect = question.getCorrectAnswer().trim().equalsIgnoreCase(answer.getAnswer().trim());
            } else {
                isCorrect = question.getCorrectAnswer().trim().equals(answer.getAnswer().trim());
            }
            
            int points = isCorrect ? question.getPoints() : 0;
            totalScore += points;
            
            log.info("Question grading - ID: {}", question.getId());
            log.info("Question text: {}", question.getQuestionText());
            log.info("User's answer: {}", answer.getAnswer());
            log.info("Points possible: {}", question.getPoints());
            log.info("Points awarded: {}", points);
            log.info("Correct? {}\n", isCorrect);
            
            questionResults.add(QuestionResultDTO.builder()
                .questionId(question.getId())
                .userAnswer(answer.getAnswer())
                .correct(isCorrect)
                .points(points)
                .maxPoints(question.getPoints())
                .build()
            );
        }
        
        boolean passed = totalScore >= quiz.getPassingScore();
        
        log.info("Quiz grading completed:");
        log.info("Total score: {} out of {} points", totalScore, totalPossiblePoints);
        log.info("Passing score required: {}", quiz.getPassingScore());
        log.info("Passed? {}", passed);
        log.info("Attempt #: {}", attemptNumber);
        
        return QuizResultDTO.builder()
            .id(UUID.randomUUID())
            .userEmail(submission.getUserEmail())
            .quizId(submission.getQuizId())
            .score(totalScore)
            .totalPossibleScore(totalPossiblePoints)
            .passed(passed)
            .attemptNumber(attemptNumber)
            .questionResults(questionResults)
            .submittedAt(submission.getSubmittedAt())
            .gradedAt(LocalDateTime.now())
            .build();
    }
    
    private int getPreviousAttemptsCount(UUID quizId, String userEmail) {
        return quizResultService.getPreviousAttemptsCount(quizId, userEmail);
    }
    
    private void validateAnswers(List<QuizAnswerDTO> answers, List<QuizQuestion> questions) {
        Set<UUID> answeredQuestionIds = answers.stream()
            .map(QuizAnswerDTO::getQuestionId)
            .collect(Collectors.toSet());
            
        Set<UUID> quizQuestionIds = questions.stream()
            .map(QuizQuestion::getId)
            .collect(Collectors.toSet());
            
        if (!answeredQuestionIds.equals(quizQuestionIds)) {
            throw new BadRequestException("Mismatch between answered questions and quiz questions");
        }
    }
    
    private void sendQuizCompletionMessages(QuizResultDTO result, QuizSubmissionDTO submission, Quiz quiz, 
                                      int totalQuizzes, int completedQuizzes, double progress,
                                      boolean firstAttempt, boolean perfectScore) {
        String userId = submission.getUserEmail();
        String courseId = quiz.getCourseId().toString();

        // Send message to Enrollment Service (Student Management Service)
        Map<String, Object> enrollmentMessage = createEnrollmentMessage(result, userId, courseId, 
            totalQuizzes, completedQuizzes, progress);
        log.info("Sending quiz completion to enrollment service - Message: {}", enrollmentMessage);
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.QUIZ_EVENTS_EXCHANGE,
            "quiz.completion.enrollment",
            enrollmentMessage,
            message -> {
                message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                return message;
            }
        );

        // Send message to User Service
        Map<String, Object> userMessage = createUserServiceMessage(result, userId, courseId, 
            firstAttempt, perfectScore);
        log.info("Sending quiz completion to user service - Exchange: {}, Routing Key: {}, Message: {}", 
            RabbitMQConfig.QUIZ_EVENTS_EXCHANGE, "quiz.completion.user", userMessage);
        try {
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.QUIZ_EVENTS_EXCHANGE,
                "quiz.completion.user",
                userMessage,
                message -> {
                    message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                    return message;
                }
            );
            log.info("Successfully sent message to user service");
        } catch (Exception e) {
            log.error("Failed to send message to user service: {}", e.getMessage(), e);
        }
    }

    private Map<String, Object> createEnrollmentMessage(QuizResultDTO result, String userId, String courseId, int totalQuizzes, int completedQuizzes, double progress) {
        Map<String, Object> message = new HashMap<>();
        
        // Convert LocalDateTime to simple integer array
        LocalDateTime completedAt = result.getGradedAt();
        List<Integer> dateArray = Arrays.asList(
            completedAt.getYear(),
            completedAt.getMonthValue(),
            completedAt.getDayOfMonth(),
            completedAt.getHour(),
            completedAt.getMinute(),
            completedAt.getSecond(),
            completedAt.getNano()
        );

        message.put("userId", userId);
        message.put("courseId", courseId);
        message.put("quizId", result.getQuizId());
        message.put("score", result.getScore());
        message.put("passed", result.isPassed());
        message.put("completedAt", dateArray);
        message.put("totalQuizzesInCourse", totalQuizzes);
        message.put("quizzesCompletedByUser", completedQuizzes);
        message.put("overallProgress", progress);
        
        return message;
    }

    private Map<String, Object> createUserServiceMessage(QuizResultDTO result, String userId, String courseId, boolean firstAttempt, boolean perfectScore) {
        Map<String, Object> message = new HashMap<>();
        
        // Convert LocalDateTime to simple integer array
        LocalDateTime completedAt = result.getGradedAt();
        List<Integer> dateArray = Arrays.asList(
            completedAt.getYear(),
            completedAt.getMonthValue(),
            completedAt.getDayOfMonth(),
            completedAt.getHour(),
            completedAt.getMinute(),
            completedAt.getSecond(),
            completedAt.getNano()
        );

        long timeElapsed = java.time.Duration.between(result.getSubmittedAt(), result.getGradedAt()).getSeconds();

        message.put("@class", "java.util.HashMap");
        message.put("userId", userId);
        message.put("courseId", courseId);
        message.put("quizId", Arrays.asList("java.util.UUID", result.getQuizId().toString()));
        message.put("score", result.getScore());
        message.put("timeElapsed", Arrays.asList("java.lang.Long", timeElapsed));
        message.put("passed", result.isPassed());
        message.put("completedAt", Arrays.asList("java.util.Arrays$ArrayList", dateArray));
        message.put("firstAttempt", firstAttempt);
        message.put("perfectScore", perfectScore);
        
        return message;
    }
}
