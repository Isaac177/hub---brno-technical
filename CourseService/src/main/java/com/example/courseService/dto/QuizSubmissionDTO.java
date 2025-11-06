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
public class QuizSubmissionDTO {
    private String id;
    private UUID courseId;
    private UUID quizId;
    private String userEmail;
    private int timeElapsed;
    private List<QuizAnswerDTO> answers;
    private LocalDateTime submittedAt;
    private QuizInfoDTO quiz;
}
