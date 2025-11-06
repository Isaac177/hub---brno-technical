package com.example.courseService.dto.request;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BatchCoursesBySchoolRequest {
    private List<UUID> schoolIds;
}
