package com.example.courseService.service;

import com.example.courseService.dto.response.CourseDTO;
import com.example.courseService.model.Course;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface CourseSimilarityService {
    Page<CourseDTO> getSimilarCourses(UUID courseId, int page, int size);
}
