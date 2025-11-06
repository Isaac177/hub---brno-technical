package com.example.courseService.service.impl;

import com.example.courseService.dto.request.CourseProgressRequest;
import com.example.courseService.dto.response.CourseProgressDTO;
import com.example.courseService.exception.implementation.ResourceNotFoundException;
import com.example.courseService.mapper.CourseProgressMapper;
import com.example.courseService.model.Course;
import com.example.courseService.model.CourseProgress;
import com.example.courseService.model.Topic;
import com.example.courseService.repository.CourseProgressRepository;
import com.example.courseService.repository.CourseRepository;
import com.example.courseService.repository.TopicRepository;
import com.example.courseService.service.CourseProgressService;

import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseProgressServiceImpl implements CourseProgressService {

    private final CourseProgressRepository repository;
    private final CourseProgressMapper mapper;
    private final TopicRepository topicRepository;
    private final CourseRepository courseRepository;
    private final MessageSource messageSource;

    // Main Methods
    @Override
    public CourseProgress createCourseProgress(@NotNull CourseProgressRequest request) {
        Course course = findCourseById(request.getCourseId());
        Topic lastTopic = findLessonById(request.getLastAccessedLessonId(), request.getCourseId());
        Set<Topic> topics = findLessonsByIds((Set<UUID>) request.getCompletedLessons());

        CourseProgress courseProgress = mapper.toEntity(request, topics, lastTopic, course);
        courseProgress.setId(UUID.randomUUID());
        return repository.save(courseProgress);
    }

    @Override
    public CourseProgress updateCourseProgress(UUID id, CourseProgressRequest request) {
        CourseProgress existing = findCourseProgressById(id);

        Course course = findCourseById(request.getCourseId());
        Topic lastTopic = findLessonById(request.getLastAccessedLessonId(), request.getCourseId());
        Set<Topic> topics = findLessonsByIds((Set<UUID>) request.getCompletedLessons());

        CourseProgress updated = mapper.toEntity(request, topics, lastTopic, course);
        updated.setId(id);

        if (hasChanges(existing, updated)) {
            return repository.save(updated);
        }
        return existing;
    }

    @Override
    public CourseProgressDTO getCourseProgressById(UUID id, Locale locale) {
        CourseProgress courseProgress = findCourseProgressById(id);
        return mapper.toDTO(courseProgress, locale);
    }

    @Override
    public void deleteCourseProgress(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public List<CourseProgressDTO> getAllCourseProgress(Locale locale) {
        return repository.findAll().stream()
                .map(c -> mapper.toDTO(c, locale))
                .collect(Collectors.toList());
    }

    // Helper Methods
    private Course findCourseById(UUID courseId) {
        Locale locale = LocaleContextHolder.getLocale();
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(messageSource.getMessage("course.not.found",
                        new Object[]{courseId}, locale)));
    }

    private Topic findLessonById(UUID lessonId, UUID courseId) {
        Locale locale = LocaleContextHolder.getLocale();
        return topicRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException(messageSource.getMessage("lesson.not.found",
                        new Object[]{courseId}, locale)));
    }

    private Set<Topic> findLessonsByIds(Set<UUID> lessonIds) {
        return new HashSet<>(topicRepository.findAllById(lessonIds));
    }

    private CourseProgress findCourseProgressById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CourseProgress not found with id: " + id));
    }

    private boolean hasChanges(CourseProgress existing, CourseProgress updated) {
        return !existing.equals(updated);
    }
}