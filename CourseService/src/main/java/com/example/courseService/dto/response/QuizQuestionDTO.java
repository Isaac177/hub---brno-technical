package com.example.courseService.dto.response;

import java.util.List;
import java.util.UUID;

import com.example.courseService.model.enums.QuestionType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionDTO {

    private UUID id;
    private UUID quizId;
    private String questionText;
    private QuestionType type;
    private List<String> options;
    private String correctAnswer;
    private Integer points;
    private String explanation;
}
