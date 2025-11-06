package com.example.courseService.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuizAnswerRequest {
    @NotNull(message = "{quiz.questionId.notNull}")
    private UUID questionId;

    @NotBlank(message = "{quiz.answer.notBlank}")
    private String answer;
}
