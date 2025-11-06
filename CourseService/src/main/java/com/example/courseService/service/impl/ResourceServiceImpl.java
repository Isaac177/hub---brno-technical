package com.example.courseService.service.impl;

import com.example.courseService.dto.request.ResourceRequest;
import com.example.courseService.dto.response.ResourceDTO;
import com.example.courseService.model.Topic;
import com.example.courseService.model.Resource;
import com.example.courseService.repository.TopicRepository;
import com.example.courseService.repository.ResourceRepository;
import com.example.courseService.exception.implementation.BadRequestException;
import com.example.courseService.mapper.ResourceMapper;

import com.example.courseService.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.javers.core.Javers;
import org.javers.core.diff.Diff;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {
    private final ResourceRepository resourceRepository;
    private final TopicRepository topicRepository;
    private final ResourceMapper resourceMapper;
    private final Javers javers;

    @Override
    public ResourceDTO createResource(ResourceRequest request) {
        Topic topic = getLessonById(request.getLessonId());
        Resource resource = mapToResource(request, topic);
        return saveAndMapToDTO(resource);
    }

    @Override
    public List<ResourceDTO> getAllResources() {
        return mapToDTOList(resourceRepository.findAll());
    }

    @Override
    public ResourceDTO getResourceById(UUID id) {
        Resource resource = getResourceByIdOrThrow(id);
        return resourceMapper.toResourceDTO(resource);
    }

    @Override
    public List<ResourceDTO> getByLessonId(UUID lessonId) {
        return mapToDTOList(resourceRepository.findByTopicId(lessonId));
    }

    @Override
    public ResourceDTO updateResource(UUID id, ResourceRequest request) {
        Resource existingResource = getResourceByIdOrThrow(id);
        Topic topic = getLessonById(request.getLessonId());

        Resource updatedResource = mapToResource(request, topic);
        updatedResource.setId(id);

        validateChanges(existingResource, updatedResource);

        return saveAndMapToDTO(updatedResource);
    }

    @Override
    public void deleteResource(UUID id) {
        resourceRepository.deleteById(id);
    }

    private Topic getLessonById(UUID lessonId) {
        return topicRepository.findById(lessonId).orElseThrow(
                () -> new BadRequestException("Lesson with id: " + lessonId + " doesn`t exist"));
    }

    private Resource getResourceByIdOrThrow(UUID id) {
        return resourceRepository.findById(id).orElseThrow(
                () -> new IllegalArgumentException("Resource not found"));
    }

    private Resource mapToResource(ResourceRequest request, Topic topic) {
        return resourceMapper.toResource(request, topic);
    }

    private void validateChanges(Resource existingResource, Resource updatedResource) {
        Diff diff = javers.compare(existingResource, updatedResource);
        if (!diff.hasChanges()) {
            throw new BadRequestException("No changes to update");
        }
    }

    private ResourceDTO saveAndMapToDTO(Resource resource) {
        Resource savedResource = resourceRepository.save(resource);
        return resourceMapper.toResourceDTO(savedResource);
    }

    private List<ResourceDTO> mapToDTOList(List<Resource> resources) {
        return resourceMapper.toResourceResponseDTOList(resources);
    }
}