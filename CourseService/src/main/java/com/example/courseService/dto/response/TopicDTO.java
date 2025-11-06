package com.example.courseService.dto.response;

import java.io.Serializable;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicDTO implements Serializable {
    private UUID id;
    private UUID sectionId;
    private String title;
    private String  duration;
    private String videoUrl;
    private boolean isPreview;
}
