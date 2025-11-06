package com.example.courseService.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.example.courseService.model.QuizQuestion;
import com.example.courseService.model.enums.DifficultyLevel;
import com.example.courseService.model.enums.QuizVisibility;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizDTO {
    private UUID id;
    private UUID courseId;
    private UUID topicId;
    private String title;
    private String description;
    private DifficultyLevel difficultyLevel;
    private Integer timeLimit;
    private Integer passingScore;
    private Integer totalPoints;
    private List<QuizQuestion> questions;
    private String helpGuidelines;
    private QuizVisibility visibility;
    private Boolean isDraft;
    private Boolean isPublished;
    private LocalDateTime createdAt;
    private LocalDateTime publishedAt;
    private LocalDateTime lastModifiedAt;
}
