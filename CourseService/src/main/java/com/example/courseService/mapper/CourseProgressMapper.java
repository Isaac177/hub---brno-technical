package com.example.courseService.mapper;

import com.example.courseService.dto.request.CourseProgressRequest;
import com.example.courseService.dto.response.CourseProgressDTO;
import com.example.courseService.model.Course;
import com.example.courseService.model.CourseProgress;
import com.example.courseService.model.Topic;

import java.util.Locale;
import java.util.Set;

public interface CourseProgressMapper {
    CourseProgress toEntity(CourseProgressRequest dto,
                            Set<Topic> topics,
                            Topic lastTopic,
                            Course course);

    CourseProgressRequest toRequestDto(CourseProgress entity);

    CourseProgressDTO toDTO(CourseProgress entity, Locale locale);
}
