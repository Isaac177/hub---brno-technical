package com.example.courseService.dto.response;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@SuperBuilder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CourseFullDTO extends CourseDTO {

    private static final long serialVersionUID = 1L;  // Add this line


    private UUID id;
    private UUID schoolId;
    private UUID categoryId;

    private String title;
    private String description;
    private String shortDescription;
    private String level;
    private String language;

    private Integer durationInWeeks;
    private Integer estimatedHours;
    private Integer enrollmentCount;

    private BigDecimal price;

    private String targetAudience;
    private String currency;
    private String status;
    private String promoVideoUrl;
    private String featuredImageUrl;

    private List<String> tags;
    private List<String> prerequisites;
    private List<String> learningObjectives;

    private Object instructors;

    private Float averageRating;
    private Float completionRate;
}
