package com.example.courseService.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class CourseUpdateRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotNull(message = "School ID is required")
    private String schoolId;
    
    private String category;
    private String level;
    private Double price;
    private Boolean isPublished;
    private String thumbnailUrl;
}
