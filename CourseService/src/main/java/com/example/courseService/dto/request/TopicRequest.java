package com.example.courseService.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TopicRequest {

    @NotNull(message = "{lessonRequest.sectionId.notNull}")
    private UUID sectionId;

    @NotBlank
    private String title;

    private String videoUrl;

    @NotBlank(message = "{lessonRequest.durationMinutes.notNull}")
    private String duration;

    @JsonAlias("isPreview")
    private boolean preview;
}
