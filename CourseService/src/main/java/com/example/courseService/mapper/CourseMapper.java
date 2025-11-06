package com.example.courseService.mapper;

import com.example.courseService.dto.request.CourseRequest;
import com.example.courseService.dto.response.CourseDTO;
import com.example.courseService.model.Course;

import java.util.Locale;
import java.util.UUID;

public interface CourseMapper {

    Course toEntity(CourseRequest dto, UUID uuid);

    CourseDTO toDTO(Course course);

    CourseDTO toFullDTO(Course course, Object instructors);
}