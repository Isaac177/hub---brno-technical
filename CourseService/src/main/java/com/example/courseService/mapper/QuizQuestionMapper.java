package com.example.courseService.mapper;

import com.example.courseService.dto.response.QuizQuestionDTO;
import com.example.courseService.dto.request.QuizQuestionRequest;
import com.example.courseService.model.Quiz;
import com.example.courseService.model.QuizQuestion;

public interface QuizQuestionMapper {
    QuizQuestion toEntity(QuizQuestionRequest request, Quiz quiz);

    QuizQuestionDTO toDTO(QuizQuestion quizQuestion);
}
