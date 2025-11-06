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
public class QuestionResultResponseDTO {
    private UUID questionId;
    private String userAnswer;
    private boolean correct;
    private int points;
    
    public static QuestionResultResponseDTO fromQuestionResult(QuestionResultDTO result) {
        return QuestionResultResponseDTO.builder()
            .questionId(result.getQuestionId())
            .userAnswer(result.getUserAnswer())
            .correct(result.isCorrect())
            .points(result.getPoints())
            .build();
    }
}
