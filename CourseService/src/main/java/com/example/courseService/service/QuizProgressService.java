package com.example.courseService.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.courseService.model.Quiz;
import com.example.courseService.repository.QuizRepository;
import com.example.courseService.repository.QuizResultRepository;
import com.example.courseService.service.QuizResultService;
import com.example.courseService.dto.QuizResultDTO;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class QuizProgressService {
    private final QuizRepository quizRepository;
    private final QuizResultRepository quizResultRepository;
    private final QuizResultService quizResultService;

    @Autowired
    public QuizProgressService(QuizRepository quizRepository, QuizResultRepository quizResultRepository, QuizResultService quizResultService) {
        this.quizRepository = quizRepository;
        this.quizResultRepository = quizResultRepository;
        this.quizResultService = quizResultService;
    }
    
    public int getTotalQuizzesInCourse(UUID courseId) {
        return quizRepository.countByCourseId(courseId);
    }
    
    public int getCompletedQuizzesByUser(UUID courseId, String userEmail) {
        return quizResultRepository.countDistinctQuizzesByUserAndCourse(courseId, userEmail);
    }
    
    public double getProgress(UUID courseId, String userEmail) {
        int totalQuizzes = getTotalQuizzesInCourse(courseId);
        if (totalQuizzes == 0) {
            return 0.0;
        }
        
        int completedQuizzes = getCompletedQuizzesByUser(courseId, userEmail);
        return (double) completedQuizzes / totalQuizzes;
    }
    
    public double calculateOverallProgress(UUID courseId, String userEmail) {
        // This can be expanded to include other types of progress (assignments, etc.)
        return getProgress(courseId, userEmail);
    }
}
