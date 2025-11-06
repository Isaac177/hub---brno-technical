package com.example.courseService.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.example.courseService.model.QuizQuestion;

import java.util.List;
import java.util.UUID;

public interface QuizQuestionRepository extends MongoRepository<QuizQuestion, UUID> {
    @Query("{ 'quiz.id' : ?0 }")
    List<QuizQuestion> findAllByQuizId(UUID quizId);
    
    @Query(value = "{ '_id' : ?0 }", fields = "{ 'questions' : 1 }")
    List<QuizQuestion> findQuestionsByQuizId(UUID quizId);
    
    @Query(value = "{ 'quizId' : ?0 }")
    List<QuizQuestion> findByQuizId(UUID quizId);
}
