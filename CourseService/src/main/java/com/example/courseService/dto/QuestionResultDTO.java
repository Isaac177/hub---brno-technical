package com.example.courseService.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResultDTO {
    private UUID questionId;
    private String userAnswer;
    private String correctAnswer;
    private boolean correct;
    private int points;
    private int maxPoints;
}
