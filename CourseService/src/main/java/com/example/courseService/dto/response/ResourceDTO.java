package com.example.courseService.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class ResourceDTO {
    private UUID id;
    private UUID lessonId;
    private String title;
    private String description;
    private String type;
    private String url;
    private Long fileSize;
    private Integer durationSeconds;
}
