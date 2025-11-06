package com.example.courseService.service;

import com.example.courseService.dto.request.QuizRequest;
import com.example.courseService.dto.response.QuizDTO;
import com.example.courseService.model.Quiz;

import java.util.List;
import java.util.UUID;

public interface QuizService {
    List<Quiz> getAllQuizzes();

    Quiz getQuizById(UUID id);

    Quiz createQuiz(QuizRequest request);

    Quiz updateQuiz(UUID id, QuizRequest request);

    void deleteQuiz(UUID id);

    List<QuizDTO> getQuizzesByCourseId(UUID courseId);
}
