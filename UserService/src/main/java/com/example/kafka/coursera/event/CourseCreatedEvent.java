package com.example.kafka.coursera.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@ToString
public class CourseCreatedEvent {
    @JsonProperty("courseId")
    private UUID courseId;
    
    @JsonProperty("categoryId")
    private UUID categoryId;
    
    @JsonProperty("title")
    private String title;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("instructorId")
    private UUID instructorId;
    
    @JsonProperty("instructorName")
    private String instructorName;
    
    @JsonProperty("instructorEmail")
    private String instructorEmail;
}