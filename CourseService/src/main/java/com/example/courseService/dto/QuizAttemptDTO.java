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
public class QuizAttemptDTO {
    private String userEmail;
    private Integer score;
    private Boolean passed;
    private Integer timeElapsed;
    private LocalDateTime submittedAt;
}
