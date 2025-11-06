package com.example.courseService.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CourseCreatedEvent {
    private UUID courseId;
    private UUID categoryId;
    private String title;
    private String description;
}