package com.example.courseService.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

import com.example.courseService.enums.ResourceType;

@Data
@Builder
public class ResourceRequest {
    @NotNull(message = "{resource.lessonId.notNull}")
    private UUID lessonId;

    @NotBlank(message = "{resource.title.notBlank}")
    private String title;

    private String description;

    @NotNull(message = "{resource.type.notNull}")
    private ResourceType type;

    @NotBlank(message = "{resource.url.notBlank}")
    private String url;

    private Long fileSize;

    private Integer durationSeconds; // optional, based on type
}
