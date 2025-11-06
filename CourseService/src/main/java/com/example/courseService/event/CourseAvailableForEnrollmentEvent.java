package com.example.courseService.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CourseAvailableForEnrollmentEvent {
    private String courseId;
    private BigDecimal price;
    private int capacity;
}