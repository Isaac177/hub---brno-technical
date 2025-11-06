package com.example.courseService.dto.response;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseProgressDTO {

    private UUID id;
    private UUID courseId;
    private UUID userId;
    private TopicDTO lastAccessedLesson;
    private Set<TopicDTO> completedLessons;
    private Float overallProgress;
    private LocalDateTime startDate;
    private LocalDateTime lastAccessDate;

    // Getters and setters
}
