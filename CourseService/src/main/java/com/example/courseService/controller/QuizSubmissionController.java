package com.example.courseService.controller;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.courseService.config.RabbitMQConfig;
import com.example.courseService.dto.QuizResultDTO;
import com.example.courseService.dto.QuizSubmissionDTO;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/quiz-submissions")
@Slf4j
public class QuizSubmissionController {
    private final RabbitTemplate rabbitTemplate;
    private final RedisTemplate<String, QuizResultDTO> redisTemplate;
    
    @Autowired
    public QuizSubmissionController(RabbitTemplate rabbitTemplate, 
            @Qualifier("quizResultRedisTemplate") RedisTemplate<String, QuizResultDTO> redisTemplate) {
        this.rabbitTemplate = rabbitTemplate;
        this.redisTemplate = redisTemplate;
    }
    
    @PostMapping
    public ResponseEntity<Map<String, String>> submitQuiz(@Valid @RequestBody QuizSubmissionDTO submission) {
        log.info("Received quiz submission for user: {}, quiz: {}", 
                submission.getUserEmail(), submission.getQuizId());
        
        String submissionId = UUID.randomUUID().toString();
        submission.setId(submissionId);
        
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.EXCHANGE_NAME,
            "event.quizSubmission",
            submission
        );
        
        return ResponseEntity.accepted().body(Map.of("submissionId", submissionId));
    }
    
    @GetMapping("/results/{submissionId}")
    public ResponseEntity<QuizResultDTO> getQuizResult(@PathVariable String submissionId) {
        log.info("Fetching quiz result for submission: {}", submissionId);
        
        try {
            // Try to get result from Redis cache
            Object rawResult = redisTemplate.opsForValue().get("quiz_result:" + submissionId);
            
            if (rawResult != null) {
                QuizResultDTO result;
                if (rawResult instanceof java.util.LinkedHashMap) {
                    // Convert LinkedHashMap to QuizResultDTO using ObjectMapper
                    ObjectMapper mapper = new ObjectMapper();
                    mapper.registerModule(new JavaTimeModule());
                    result = mapper.convertValue(rawResult, QuizResultDTO.class);
                } else {
                    result = (QuizResultDTO) rawResult;
                }
                
                log.info("Found result in Redis: {}", result);
                return ResponseEntity.ok(result);
            } else {
                log.info("Result not found in Redis for submission: {}", submissionId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error fetching quiz result: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
