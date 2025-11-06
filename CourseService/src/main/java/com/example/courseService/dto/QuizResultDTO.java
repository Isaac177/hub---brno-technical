package com.example.courseService.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "quiz_results")
public class QuizResultDTO {
    private UUID id;
    private String submissionId;
    private String userEmail;
    private UUID quizId;
    private int score;
    private int totalPossibleScore;
    private boolean passed;
    private int attemptNumber;
    private List<QuestionResultDTO> questionResults;
    private LocalDateTime submittedAt;
    private LocalDateTime gradedAt;
}
