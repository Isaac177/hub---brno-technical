package com.example.courseService.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.example.courseService.enums.ResourceType;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {
    @Id
    private UUID id;
    @DBRef
    private Topic topic;
    private String title;
    private String description;
    @Enumerated(EnumType.STRING)
    private ResourceType type;
    private String url;
    private Long fileSize;
    private Integer durationSeconds; // for video/audio
}
