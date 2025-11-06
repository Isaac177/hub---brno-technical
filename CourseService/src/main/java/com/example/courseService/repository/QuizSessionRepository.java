package com.example.courseService.repository;

import com.example.courseService.model.QuizSession;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.UUID;

public interface QuizSessionRepository extends MongoRepository<QuizSession, UUID> {
    QuizSession findByUserIdAndQuizId(UUID userId, UUID quizId);

}
