package com.example.courseService.mapper;

import com.example.courseService.dto.request.QuizRequest;
import com.example.courseService.dto.response.QuizDTO;
import com.example.courseService.model.Quiz;

public interface QuizMapper {
    Quiz toEntity(QuizRequest request);
    
    Quiz updateEntityFromRequest(Quiz existingQuiz, QuizRequest request);

    QuizDTO toDTO(Quiz quiz);
}
