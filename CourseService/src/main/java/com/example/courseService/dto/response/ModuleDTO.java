package com.example.courseService.dto.response;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ModuleDTO implements Serializable {
    private UUID id;
    private UUID courseId;
    private String title;
    private String duration;
    private String thumbnailUrl;
    private List<TopicDTO> topics = new ArrayList<>();
    private int lectures;
}
