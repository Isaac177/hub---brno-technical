package com.example.courseService.mapper.impl;

import com.example.courseService.dto.request.TopicRequest;
import com.example.courseService.dto.response.TopicDTO;
import com.example.courseService.mapper.TopicMapper;
import com.example.courseService.model.Module;
import com.example.courseService.model.Topic;
import com.example.courseService.utils.DurationUtils;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.UUID;

@Component
public class TopicMapperImpl implements TopicMapper {

        @Override
        public Topic toTopic(TopicRequest topicRequest, Module module) {
                // Parse "HH:mm:ss" formatted duration string
                Duration duration = DurationUtils.string2Duration(topicRequest.getDuration());


                UUID uuid = UUID.randomUUID();
                Topic topic = new Topic();
                topic.setId(uuid);
                topic.setModule(module);
                topic.setDuration(duration);
                topic.setTitle(topicRequest.getTitle());
                topic.setVideoUrl(topicRequest.getVideoUrl());
                topic.setPreview(topicRequest.isPreview());
                return topic;
        }

        @Override
        public TopicDTO toTopicDTO(Topic topic) {
                // Extract hours, minutes, and seconds from Duration
                String formattedDuration = DurationUtils.duration2String(topic.getDuration());

                return TopicDTO.builder()
                        .id(topic.getId())
                        .sectionId(topic.getModule().getId())
                        .title(topic.getTitle())
                        .duration(formattedDuration)
                        .videoUrl(topic.getVideoUrl())
                        .isPreview(topic.isPreview())
                        .build();
        }

}
