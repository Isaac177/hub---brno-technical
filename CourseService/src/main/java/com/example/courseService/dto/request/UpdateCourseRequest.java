package com.example.courseService.dto.request;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.example.courseService.enums.Language;
import com.example.courseService.model.File;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCourseRequest {

    public interface BasicInfo {
    }

    public interface Media {
    }

    public interface Content {
    }

    public interface Pricing {
    }

    private UUID schoolId;

    @Size(min = 4, message = "{title.size}", groups = { BasicInfo.class })
    private String title;

    private String description;
    private String longDescription;
    private UUID categoryId;
    private Language language;

    private transient File thumbnail;
    private transient File featuredImage;

    private List<String> requirements;
    private List<String> learningObjectives;

    @Size(max = 100, message = "{syllabus.size}", groups = { Content.class })
    private List<ModuleRequest> syllabus;

    @Min(value = 0, message = "{price.min}", groups = { Pricing.class })
    private BigDecimal price;

    private List<String> tags;
    private List<Language> subtitles;

    public boolean hasBasicInfoUpdates() {
        return title != null || description != null || longDescription != null ||
                schoolId != null || categoryId != null || language != null;
    }

    public boolean hasMediaUpdates() {
        return featuredImage != null || thumbnail != null;
    }

    public boolean hasContentUpdates() {
        return requirements != null || learningObjectives != null || syllabus != null;
    }

    public boolean hasPricingUpdates() {
        return price != null || tags != null || subtitles != null;
    }

    // Helper method to check if any update is present
    public boolean hasAnyUpdates() {
        return hasBasicInfoUpdates() || hasContentUpdates() || hasPricingUpdates();
    }

    // Static factory method to create from CourseRequest (for backward
    // compatibility)
    public static UpdateCourseRequest fromCourseRequest(CourseRequest courseRequest) {
        return UpdateCourseRequest.builder()
                .schoolId(courseRequest.getSchoolId())
                .title(courseRequest.getTitle())
                .description(courseRequest.getDescription())
                .longDescription(courseRequest.getLongDescription())
                .categoryId(courseRequest.getCategoryId())
                .language(courseRequest.getLanguage())
                .price(courseRequest.getPrice())
                .tags(courseRequest.getTags())
                .requirements(courseRequest.getRequirements())
                .learningObjectives(courseRequest.getLearningObjectives())
                .syllabus(courseRequest.getSyllabus())
                .subtitles(courseRequest.getSubtitles())
                .build();
    }
}
