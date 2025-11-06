package com.example.courseService.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.example.courseService.dto.QuizResultDTO;
import java.util.Set;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class QuizResultService {
    private final RedisTemplate<String, QuizResultDTO> redisTemplate;

    @Autowired
    public QuizResultService(@Qualifier("quizResultRedisTemplate") RedisTemplate<String, QuizResultDTO> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public QuizResultDTO getLatestQuizResult(UUID quizId, String userEmail) {
        Set<String> keys = redisTemplate.keys("quiz_result:*");
        if (keys == null || keys.isEmpty()) {
            return null;
        }

        return keys.stream()
            .map(key -> {
                try {
                    return redisTemplate.opsForValue().get(key);
                } catch (Exception e) {
                    log.error("Error retrieving quiz result for key {}: {}", key, e.getMessage());
                    return null;
                }
            })
            .filter(result -> result != null 
                && quizId.equals(result.getQuizId()) 
                && userEmail.equals(result.getUserEmail()))
            .max((r1, r2) -> r1.getGradedAt().compareTo(r2.getGradedAt()))
            .orElse(null);
    }

    public void storeQuizResult(String submissionId, QuizResultDTO result) {
        String redisKey = "quiz_result:" + submissionId;
        redisTemplate.opsForValue().set(redisKey, result);
    }

    public int getPreviousAttemptsCount(UUID quizId, String userEmail) {
        Set<String> keys = redisTemplate.keys("quiz_result:*");
        if (keys == null || keys.isEmpty()) {
            return 0;
        }
        
        return (int) keys.stream()
            .map(key -> {
                try {
                    return redisTemplate.opsForValue().get(key);
                } catch (Exception e) {
                    log.error("Error retrieving quiz result for key {}: {}", key, e.getMessage());
                    return null;
                }
            })
            .filter(result -> result != null 
                && quizId.equals(result.getQuizId()) 
                && userEmail.equals(result.getUserEmail()))
            .count();
    }
}
