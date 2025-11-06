package com.example.courseService.mapper.impl;

import com.example.courseService.dto.response.QuizQuestionDTO;
import com.example.courseService.dto.request.QuizQuestionRequest;
import com.example.courseService.mapper.QuizQuestionMapper;
import com.example.courseService.model.Quiz;
import com.example.courseService.model.QuizQuestion;
import org.springframework.stereotype.Component;

@Component
public class QuizQuestionMapperImpl implements QuizQuestionMapper {

    @Override
    public QuizQuestion toEntity(QuizQuestionRequest request, Quiz quiz) {
        return QuizQuestion.builder()
                .quizId(quiz.getId())
                .questionText(request.getQuestionText())
                .type(request.getType())
                .options(request.getOptions())
                .correctAnswer(request.getCorrectAnswer())
                .points(request.getPoints())
                .explanation(request.getExplanation())
                .build();
    }

    @Override
    public QuizQuestionDTO toDTO(QuizQuestion quizQuestion) {
        if (quizQuestion == null) {
            return null;
        }
        
        return QuizQuestionDTO.builder()
                .id(quizQuestion.getId())
                .quizId(quizQuestion.getQuizId())
                .questionText(quizQuestion.getQuestionText())
                .type(quizQuestion.getType())
                .options(quizQuestion.getOptions())
                .correctAnswer(quizQuestion.getCorrectAnswer())
                .points(quizQuestion.getPoints())
                .explanation(quizQuestion.getExplanation())
                .build();
    }
}
