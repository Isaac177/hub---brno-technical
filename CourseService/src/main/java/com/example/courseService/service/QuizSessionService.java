package com.example.courseService.service;

import com.example.courseService.model.QuizSession;

import java.util.UUID;

public interface QuizSessionService {

    QuizSession startSession(UUID quizId, UUID userId);

    QuizSession getSession(UUID sessionId);

    void completeSession(UUID sessionId, int points);
}
