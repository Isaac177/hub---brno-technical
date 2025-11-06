package com.example.courseService.service;

import com.example.courseService.dto.request.ResourceRequest;
import com.example.courseService.dto.response.ResourceDTO;

import java.util.List;
import java.util.UUID;

public interface ResourceService {
    ResourceDTO createResource(ResourceRequest request);

    List<ResourceDTO> getAllResources();

    ResourceDTO getResourceById(UUID id);

    List<ResourceDTO> getByLessonId(UUID id);

    ResourceDTO updateResource(UUID id, ResourceRequest request);

    void deleteResource(UUID id);
}
