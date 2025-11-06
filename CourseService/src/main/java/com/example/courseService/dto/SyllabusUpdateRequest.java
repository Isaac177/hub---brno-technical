package com.example.courseService.dto;

import lombok.Data;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Data
public class SyllabusUpdateRequest {
    @NotEmpty(message = "Modules cannot be empty")
    private List<ModuleDto> modules;

    @Data
    public static class ModuleDto {
        @NotBlank(message = "Module title is required")
        private String title;
        private String description;
        private List<TopicDto> topics;
    }

    @Data
    public static class TopicDto {
        @NotBlank(message = "Topic title is required")
        private String title;
        private String description;
        private String videoUrl;
        private String duration;
        private Boolean isPreview;
    }
}
