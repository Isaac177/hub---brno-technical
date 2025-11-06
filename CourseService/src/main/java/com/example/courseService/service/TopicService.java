package com.example.courseService.service;

import com.example.courseService.dto.request.TopicRequest;
import com.example.courseService.dto.response.TopicDTO;
import com.example.courseService.model.Topic;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

public interface TopicService {
    Topic createTopic(TopicRequest request);

    Topic updateTopic(@Valid TopicRequest lessonDetails, UUID id);

    List<TopicDTO> getAllTopics();

    TopicDTO getTopicById(UUID id);

    List<TopicDTO> getTopicBySyllabusId(UUID sectionId);

    void deleteTopic(UUID id);
}
