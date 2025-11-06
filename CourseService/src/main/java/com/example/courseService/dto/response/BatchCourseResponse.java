package com.example.courseService.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchCourseResponse {
    private boolean success;
    private List<CourseDTO> courses;
    private Map<UUID, String> errors;
}
