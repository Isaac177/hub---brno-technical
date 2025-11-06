package com.example.courseService.service;

import com.example.courseService.dto.request.CourseProgressRequest;
import com.example.courseService.dto.response.CourseProgressDTO;
import com.example.courseService.model.CourseProgress;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

public interface CourseProgressService{

    CourseProgress createCourseProgress(CourseProgressRequest request);

    CourseProgress updateCourseProgress(UUID id, CourseProgressRequest request);

    CourseProgressDTO getCourseProgressById(UUID id, Locale locale);

    void deleteCourseProgress(UUID id);

    List<CourseProgressDTO> getAllCourseProgress(Locale locale);
}
