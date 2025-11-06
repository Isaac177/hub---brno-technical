package com.example.courseService.mapper.impl;

import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.example.courseService.dto.request.ModuleRequest;
import com.example.courseService.dto.response.ModuleDTO;
import com.example.courseService.mapper.ModuleMapper;
import com.example.courseService.mapper.TopicMapper;
import com.example.courseService.model.Course;
import com.example.courseService.model.Module;

import com.example.courseService.utils.DurationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ModuleMapperImpl implements ModuleMapper {

    private final TopicMapper topicMapper;

    @Override
    public Module toEntity(ModuleRequest moduleRequest, Course course) {
        UUID uuid = UUID.randomUUID();
        return Module.builder()
                .id(uuid)
                .title(moduleRequest.getTitle())
                .course(course)
                .duration(
                        moduleRequest.getDuration() != null && !moduleRequest.getDuration().isBlank()
                                ?         DurationUtils.string2Duration(
                                moduleRequest.getDuration())
                                : Duration.ofHours(0)) // Default to "0" or an appropriate default duration
                .thumbnailUrl(moduleRequest.getThumbnailUrl())
                .topics(null) // will be set in service
                .build();
    }

    @Override
    public ModuleDTO toDto(Module module) {
        // Format as "HH:mm:ss"
        String formattedDuration = DurationUtils.duration2String(module.getDuration());

        return ModuleDTO.builder()
                .id(module.getId())
                .courseId(module.getCourse().getId())
                .title(module.getTitle())
                .topics((module.getTopics()!= null) ?
                        module.getTopics()
                                .stream()
                                .map(topicMapper::toTopicDTO)
                                .collect(Collectors.toList())
                        : null)
                .duration(formattedDuration)
                .lectures((module.getTopics()!= null) ? module.getTopics().size() : 0)
                .build();
    }


    @Override
    public List<ModuleDTO> toDtoList(List<Module> syllabus) {
        return syllabus.stream().map(this::toDto).collect(Collectors.toList());
    }
}