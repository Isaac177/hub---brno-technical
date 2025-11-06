package com.example.courseService.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.example.courseService.model.Quiz;

import java.util.List;
import java.util.UUID;

public interface QuizRepository extends MongoRepository<Quiz, UUID> {
    List<Quiz> findByCourseId(UUID courseId);
    
    @Query(value = "{ '_id' : ?0 }", fields = "{ 'questions': 1, '_id': 1, 'courseId': 1, 'topic': 1, 'title': 1, 'description': 1, 'difficultyLevel': 1, 'timeLimit': 1, 'passingScore': 1, 'totalPoints': 1, 'helpGuidelines': 1, 'visibility': 1, 'isDraft': 1, 'isPublished': 1, 'createdAt': 1, 'publishedAt': 1, 'lastModifiedAt': 1 }")
    Quiz findQuizWithQuestions(UUID quizId);

    int countByCourseId(UUID courseId);
}
