package com.example.courseService.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizCompletionMessage {
    private String userId;
    private String courseId;
    private String quizId;
    private int score;
    private boolean passed;
    private LocalDateTime completedAt;
    private int totalQuizzesInCourse;
    private int quizzesCompletedByUser;
    private double overallProgress;
}
