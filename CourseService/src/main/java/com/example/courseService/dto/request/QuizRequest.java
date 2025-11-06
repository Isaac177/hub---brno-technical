package com.example.courseService.dto.request;

import java.util.List;
import java.util.UUID;

import com.example.courseService.model.enums.DifficultyLevel;
import com.example.courseService.model.enums.QuizVisibility;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizRequest {
    @NotNull(message = "Topic ID cannot be null")
    private UUID topicId;

    @NotNull(message = "Course ID cannot be null")
    private UUID courseId;

    @NotBlank(message = "Title cannot be blank")
    private String title;

    private String description;
    
    private DifficultyLevel difficultyLevel;
    
    @Min(1)
    private Integer timeLimit;
    
    @Min(0)
    private Integer passingScore;
    
    @NotNull(message = "Total points cannot be null")
    @Min(value = 1, message = "Total points must be at least 1")
    private Integer totalPoints;
    
    private String helpGuidelines;
    
    private QuizVisibility visibility;
    
    private Boolean isDraft;
    
    private List<QuizQuestionRequest> questions;
}
