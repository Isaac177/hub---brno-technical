package com.example.courseService.service;

import com.example.courseService.dto.request.QuizAnswerRequest;
import com.example.courseService.dto.request.QuizQuestionRequest;
import com.example.courseService.model.QuizQuestion;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuizQuestionService {
    List<QuizQuestion> getAllQuizQuestions();

    Optional<QuizQuestion> getQuizQuestionById(UUID id);

    QuizQuestion createQuizQuestion(QuizQuestionRequest request);

    QuizQuestion updateQuizQuestion(UUID id, QuizQuestionRequest request);

    void deleteQuizQuestion(UUID id);

    List<QuizQuestion> getQuestionsByQuizId(UUID quizId);

    int calculateScore(UUID quizId, List<QuizAnswerRequest> userAnswers);
}
