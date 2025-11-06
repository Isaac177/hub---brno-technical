package com.example.courseService.repository;

import com.example.courseService.dto.QuizResultDTO;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface QuizResultRepository extends MongoRepository<QuizResultDTO, UUID> {
    
    @Query(value = "{ 'quiz.courseId': ?0, 'userEmail': ?1, 'passed': true }", count = true)
    int countDistinctQuizzesByUserAndCourse(UUID courseId, String userEmail);
}
