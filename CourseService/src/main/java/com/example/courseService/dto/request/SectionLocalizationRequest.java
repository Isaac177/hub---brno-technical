package com.example.courseService.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SectionLocalizationRequest {
    @NotBlank(message = "{section.language.notBlank}")
    private String language;

    @NotBlank(message = "{section.title.notBlank}")
    private String title;

    @NotBlank(message = "{section.description.notBlank}")
    private String description;
}
