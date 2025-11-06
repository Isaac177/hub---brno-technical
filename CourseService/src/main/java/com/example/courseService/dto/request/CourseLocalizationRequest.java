package com.example.courseService.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseLocalizationRequest {
    @NotBlank(message = "{course.language.notBlank}")
    private String language;

    @NotBlank(message = "{course.title.notBlank}")
    private String title;

    private String description;
    private String shortDescription;
}
