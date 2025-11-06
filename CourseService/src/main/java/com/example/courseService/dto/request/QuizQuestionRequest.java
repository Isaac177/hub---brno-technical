package com.example.courseService.dto.request;

import java.util.List;
import java.util.UUID;

import com.example.courseService.model.enums.QuestionType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionRequest {
    @NotNull(message = "Quiz ID cannot be null")
    private UUID quizId;

    @NotBlank(message = "Question text cannot be blank")
    private String questionText;

    @NotNull(message = "Question type cannot be null")
    private QuestionType type;

    private List<String> options;

    @NotBlank(message = "Correct answer cannot be blank")
    private String correctAnswer;

    @NotNull(message = "Points cannot be null")
    @Min(value = 1, message = "Points must be at least 1")
    private Integer points;
    
    private String explanation;
}
