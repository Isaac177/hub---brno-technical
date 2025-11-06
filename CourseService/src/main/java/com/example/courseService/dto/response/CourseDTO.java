package com.example.courseService.dto.response;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseDTO implements Serializable {

    private static final long serialVersionUID = 1L;  // Add this line


    private UUID id;
    private UUID schoolId;
    private UUID categoryId;

    private String title;
    private String description;
    private String longDescription;
    private String language;

    @JsonProperty("price")
    private BigDecimal price;


    private String thumbnailUrl;
    private String featuredImageUrl;

    @JsonProperty("tags")
    private List<String> tags;
    @JsonProperty("requirements")
    private List<String> requirements;
    @JsonProperty("learningObjectives")
    private List<String> learningObjectives;
    @JsonProperty("subtitles")
    private List<String> subtitles;
    @JsonProperty("syllabus")
    private List<ModuleDTO> syllabus;

    private Integer instructorsCount;
    @JsonProperty("quizzes")
    private List<QuizDTO> quizzes;

}
