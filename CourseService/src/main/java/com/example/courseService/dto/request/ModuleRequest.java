package com.example.courseService.dto.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ModuleRequest {

    @NotNull(message = "{sectionRequest.courseId.notNull}")
    private UUID courseId;
    @NotBlank
    private String title;
    @NotBlank
    private String duration;
    private String thumbnailUrl;
    @Size(min = 1)
    private List<TopicRequest> topics;
}
