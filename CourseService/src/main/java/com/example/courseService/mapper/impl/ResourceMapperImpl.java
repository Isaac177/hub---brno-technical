package com.example.courseService.mapper.impl;

import com.example.courseService.dto.request.ResourceRequest;
import com.example.courseService.dto.response.ResourceDTO;
import com.example.courseService.mapper.ResourceMapper;
import com.example.courseService.model.Topic;
import com.example.courseService.model.Resource;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ResourceMapperImpl implements ResourceMapper {
    @Override
    public Resource toResource(ResourceRequest request, Topic topic) {
        return Resource.builder()
                .topic(topic)
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .url(request.getUrl())
                .fileSize(request.getFileSize())
                .durationSeconds(request.getDurationSeconds())
                .build();
    }
    @Override
    public ResourceDTO toResourceDTO(Resource resource) {
        return ResourceDTO.builder()
                .id(resource.getId())
                .lessonId(resource.getTopic().getId())
                .title(resource.getTitle())
                .description(resource.getDescription())
                .type(resource.getType().name())
                .url(resource.getUrl())
                .fileSize(resource.getFileSize())
                .durationSeconds(resource.getDurationSeconds())
                .build();
    }
    @Override
    public List<ResourceDTO> toResourceResponseDTOList(List<Resource> resources) {
        return resources.stream()
                .map(this::toResourceDTO)
                .collect(Collectors.toList());
    }
}
