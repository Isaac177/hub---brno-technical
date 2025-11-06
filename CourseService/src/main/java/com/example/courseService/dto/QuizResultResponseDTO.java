package com.example.courseService.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultResponseDTO {
    private UUID id;
    private String submissionId;
    private String userEmail;
    private UUID quizId;
    private int score;
    private int totalPossibleScore;
    private boolean passed;
    private int attemptNumber;
    private List<QuestionResponseDTO> questionResults;
    private LocalDateTime submittedAt;
    private LocalDateTime gradedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResponseDTO {
        private UUID questionId;
        private String userAnswer;
        private boolean correct;
        private int points;
        private int maxPoints;

        public static QuestionResponseDTO fromQuestionResult(QuestionResultDTO result) {
            return QuestionResponseDTO.builder()
                    .questionId(result.getQuestionId())
                    .userAnswer(result.getUserAnswer())
                    .correct(result.isCorrect())
                    .points(result.getPoints())
                    .maxPoints(result.getMaxPoints())
                    .build();
        }
    }
    
    public static QuizResultResponseDTO fromQuizResult(QuizResultDTO result) {
        return QuizResultResponseDTO.builder()
            .id(result.getId())
            .submissionId(result.getSubmissionId())
            .userEmail(result.getUserEmail())
            .quizId(result.getQuizId())
            .score(result.getScore())
            .totalPossibleScore(result.getTotalPossibleScore())
            .passed(result.isPassed())
            .attemptNumber(result.getAttemptNumber())
            .questionResults(result.getQuestionResults().stream()
                .map(QuestionResponseDTO::fromQuestionResult)
                .toList())
            .submittedAt(result.getSubmittedAt())
            .gradedAt(result.getGradedAt())
            .build();
    }
}
