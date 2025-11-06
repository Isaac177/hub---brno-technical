package com.example.courseService.mapper.impl;

import com.example.courseService.dto.request.CourseProgressRequest;
import com.example.courseService.dto.response.CourseProgressDTO;
import com.example.courseService.dto.response.TopicDTO;
import com.example.courseService.mapper.CourseProgressMapper;
import com.example.courseService.mapper.TopicMapper;
import com.example.courseService.model.Course;
import com.example.courseService.model.CourseProgress;
import com.example.courseService.model.Topic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class CourseProgressMapperImpl implements CourseProgressMapper {

        private final TopicMapper topicMapper;

        @Autowired
        public CourseProgressMapperImpl(TopicMapper topicMapper) {
                this.topicMapper = topicMapper;
        }

        @Override
        public CourseProgress toEntity(CourseProgressRequest dto, Set<Topic> topics, Topic lastTopic,
                                       Course course) {
                // Ensure the IDs are valid, or throw an exception if not found
                return CourseProgress.builder()
                                .course(course)
                                .userId(dto.getUserId())
                                .lastAccessedTopic(lastTopic)
                                .completedTopics(topics)
                                .overallProgress(dto.getOverallProgress())
                                .startDate(dto.getStartDate())
                                .lastAccessDate(dto.getLastAccessDate())
                                .build();
        }
        @Override
        public CourseProgressRequest toRequestDto(CourseProgress entity) {
                return CourseProgressRequest.builder()
                                .courseId(entity.getCourse().getId())
                                .userId(entity.getUserId())
                                .lastAccessedLessonId(entity.getLastAccessedTopic().getId())
                                .completedLessons(
                                                entity.getCompletedTopics().stream().map(Topic::getId)
                                                                .collect(Collectors.toSet()))
                                .overallProgress(entity.getOverallProgress())
                                .startDate(entity.getStartDate())
                                .lastAccessDate(entity.getLastAccessDate())
                                .build();
        }
        @Override
        public CourseProgressDTO toDTO(CourseProgress entity, Locale locale) {
                TopicDTO lDto = topicMapper.toTopicDTO(entity.getLastAccessedTopic());
                Set<TopicDTO> lDtos = entity.getCompletedTopics().stream()
                                .map(topicMapper::toTopicDTO)
                                .collect(Collectors.toSet());
                return CourseProgressDTO.builder()
                                .id(entity.getId())
                                .courseId(entity.getCourse().getId())
                                .userId(entity.getUserId())
                                .lastAccessedLesson(lDto)
                                .completedLessons(lDtos)
                                .overallProgress(entity.getOverallProgress())
                                .startDate(entity.getStartDate())
                                .lastAccessDate(entity.getLastAccessDate())
                                .build();
        }
}
