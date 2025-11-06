package com.example.courseService.dto.request;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseProgressRequest {

    @NotNull(message = "{courseProgressRequest.courseId.notNull}")
    private UUID courseId;

    @NotNull(message = "{courseProgressRequest.userId.notNull}")
    private UUID userId;

    @NotNull(message = "{courseProgressRequest.lastAccessedLessonId.notNull}")
    private UUID lastAccessedLessonId;

    @NotNull(message = "{courseProgressRequest.completedLessons.notNull}")
    private Set<UUID> completedLessons;

    @NotNull(message = "{courseProgressRequest.overallProgress.notNull}")
    @Max(value = 1)
    private Float overallProgress;

    @NotNull(message = "{courseProgressRequest.startDate.notNull}")
    private LocalDateTime startDate;

    @NotNull(message = "{courseProgressRequest.lastAccessDate.notNull}")
    private LocalDateTime lastAccessDate;
}
