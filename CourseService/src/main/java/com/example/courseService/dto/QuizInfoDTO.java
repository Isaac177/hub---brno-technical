package com.example.courseService.dto;

import com.example.courseService.model.enums.DifficultyLevel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizInfoDTO {
    private String title;
    private String description;
    private int timeLimit;
    private int passingScore;
    private int totalPoints;
    private DifficultyLevel difficultyLevel;
}
