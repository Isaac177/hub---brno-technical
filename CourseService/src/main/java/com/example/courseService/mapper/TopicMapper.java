package com.example.courseService.mapper;

import com.example.courseService.dto.request.TopicRequest;
import com.example.courseService.dto.response.TopicDTO;
import com.example.courseService.model.Module;
import com.example.courseService.model.Topic;

import java.util.UUID;

public interface TopicMapper {
    Topic toTopic(TopicRequest topicRequest, Module syllabus);

    TopicDTO toTopicDTO(Topic topic);
}
