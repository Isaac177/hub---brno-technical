package com.example.courseService.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CourseMetadataEvent {
    private String courseId;
    private Duration duration;
    private LocalDate startDate;
    private List<String> prerequisites;
}