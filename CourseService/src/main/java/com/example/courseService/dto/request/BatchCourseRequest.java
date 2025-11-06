package com.example.courseService.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BatchCourseRequest {
    @NotEmpty(message = "Course IDs list cannot be empty")
    @Size(max = 50, message = "Maximum 50 course IDs can be requested at once")
    private List<UUID> courseIds;
}
