package com.example.courseService.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonLocalizationRequest {
    @NotBlank(message = "{lesson.language.notBlank}")
    private String language;

    @NotBlank(message = "{lesson.title.notBlank}")
    private String title;

    private String description;
    private String content;
}
