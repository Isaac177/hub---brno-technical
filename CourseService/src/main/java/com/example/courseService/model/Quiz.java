package com.example.courseService.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.example.courseService.model.enums.DifficultyLevel;
import com.example.courseService.model.enums.QuizVisibility;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "quizzes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {
    @Id
    private UUID id;

    @NotNull
    private UUID courseId;

    @NotNull
    @DBRef
    private Topic topic;

    @NotBlank
    private String title;

    private String description;
    
    private DifficultyLevel difficultyLevel;
    
    @Min(1)
    private Integer timeLimit;
    
    @Min(0)
    private Integer passingScore;
    
    @Min(1)
    @NotNull
    private Integer totalPoints;
    
    @DBRef
    private List<QuizQuestion> questions;
    
    private String helpGuidelines;
    
    private QuizVisibility visibility;
    
    private Boolean isDraft;
    
    private Boolean isPublished;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime publishedAt;
    
    private LocalDateTime lastModifiedAt;
}
