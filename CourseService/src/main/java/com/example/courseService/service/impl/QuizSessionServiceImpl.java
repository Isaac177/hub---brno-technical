package com.example.courseService.service.impl;

import com.example.courseService.model.QuizSession;
import com.example.courseService.repository.QuizSessionRepository;
import com.example.courseService.exception.implementation.BadRequestException;
import com.example.courseService.exception.implementation.ResourceNotFoundException;

import com.example.courseService.service.QuizSessionService;
import lombok.RequiredArgsConstructor;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class QuizSessionServiceImpl implements QuizSessionService {

    private final RedisTemplate<String, Object> redisTemplate; // Make sure this matches your configuration
    private final QuizSessionRepository quizSessionRepository;
    private final MessageSource messageSource;

    @Override
    public QuizSession startSession(UUID quizId, UUID userId) {

        QuizSession existingSession = quizSessionRepository.findByUserIdAndQuizId(userId, quizId);
        if (existingSession != null)
            throw new BadRequestException(
                    messageSource.getMessage("quiz.game.alreadyCompleted", null, LocaleContextHolder.getLocale()));

        QuizSession session = QuizSession.builder()
                .id(UUID.randomUUID())
                .quizId(quizId)
                .userId(userId)
                .startTime(System.currentTimeMillis())
                .isCompleted(false)
                .build();
        String sessionKey = createSessionKey2Redis(userId, quizId);
        // Save session to Redis
        redisTemplate.opsForValue().set(sessionKey, session, 10,
                TimeUnit.MINUTES);

        return session;
    }

    @Override
    public QuizSession getSession(UUID sessionId) {
        return quizSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }

    @Override
    public void completeSession(UUID sessionId, int points) {
        QuizSession existingSession = (QuizSession) redisTemplate.opsForValue().get("sessionId:" + sessionId);

        if (existingSession == null) {
            throw new ResourceNotFoundException("Session with Id: " + sessionId + " not found");
        }

        if (existingSession.getIsCompleted()) {
            throw new BadRequestException("Able to submit only once");
        }

        existingSession.setIsCompleted(true);
        existingSession.setFinishedIn(System.currentTimeMillis() - existingSession.getStartTime());
        existingSession.setPoints(points);
        redisTemplate.opsForValue().set("sessionId:" + existingSession.getUserId() + existingSession.getQuizId(),
                existingSession, 5,
                TimeUnit.MINUTES);
        existingSession.setSubmitedAt(LocalDateTime.now());
        quizSessionRepository.save(existingSession);
    }

    private String createSessionKey2Redis(UUID userId, UUID quizId) {
        return "sessionKey:" + userId + quizId;
    }

}
