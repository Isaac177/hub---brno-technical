package com.example.courseService.dto.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class QuizSubmitRequest {
    @NotNull(message = "{quizSubmitRequest.sessionId.notNull}")
    private UUID sessionId;

    @NotNull(message = "{quizSubmitRequest.userId.notNull}")
    private UUID userId;

    @NotNull(message = "{quizSubmitRequest.quizId.notNull}")
    private UUID quizId;

    private List<QuizAnswerRequest> userAnswers;
}
