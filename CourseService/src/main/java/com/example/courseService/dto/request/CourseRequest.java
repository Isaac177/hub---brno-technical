package com.example.courseService.dto.request;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.example.courseService.enums.Language;
import com.example.courseService.model.File;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRequest {

    // Validation groups
    public interface Create {}
    public interface Update {}

    @NotNull(message = "{schoolId.notNull}", groups = {Create.class})
    private UUID schoolId;

    @NotBlank(groups = {Create.class})
    @Size(min = 4, groups = {Create.class})
    private String title;

    private String description;
    private String longDescription;

    @NotNull(message = "{categoryId.notNull}", groups = {Create.class})
    private UUID categoryId;

    private Language language;

    @NotNull(message = "{price.notNull}", groups = {Create.class})
    @Min(value = 0, message = "{price.min}")
    private BigDecimal price;

    private transient File thumbnail;
    private transient File featuredImage;

    private List<String> tags;
    private List<String> requirements;

    @Size(min = 1, max = 100, groups = {Create.class})
    private List<ModuleRequest> syllabus;

    @NotNull(message = "{learningObjectives.notNull}", groups = {Create.class})
    @Size(min = 1, message = "{learningObjectives.size}", groups = {Create.class})
    private List<String> learningObjectives;

    private List<Language> subtitles;
}
