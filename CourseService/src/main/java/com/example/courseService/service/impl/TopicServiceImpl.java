package com.example.courseService.service.impl;

import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import com.example.courseService.dto.request.TopicRequest;
import com.example.courseService.dto.response.TopicDTO;
import com.example.courseService.model.Module;
import com.example.courseService.service.TopicService;
import org.jetbrains.annotations.NotNull;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import com.example.courseService.model.Topic;
import com.example.courseService.repository.TopicRepository;
import com.example.courseService.repository.ModuleRepository;
import com.example.courseService.exception.implementation.BadRequestException;
import com.example.courseService.exception.implementation.NoChangesException;
import com.example.courseService.exception.implementation.ResourceNotFoundException;
import com.example.courseService.mapper.TopicMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TopicServiceImpl implements TopicService {

    private final TopicRepository repository;
    private final TopicMapper mapper;
    private final ModuleRepository moduleRepository;
    private final MessageSource messageSource;

    // Main Methods
    @Override
    public Topic createTopic(@NotNull TopicRequest request) {
        Module module = findSectionById(request.getSectionId());
        Topic topic = mapper.toTopic(request, module);

        return repository.save(topic);
    }

    @Override
    public Topic updateTopic(@NotNull @Valid TopicRequest lessonDetails, UUID id) {
        Locale locale = LocaleContextHolder.getLocale();
        Topic existingTopic = findLessonById(id);
        Module module = findSectionById(lessonDetails.getSectionId());

        Topic updatedTopic = mapper.toTopic(lessonDetails, module);
        updatedTopic.setId(id);

        if (!hasChanges(existingTopic, updatedTopic, module)) {
            throw new NoChangesException(messageSource, locale);
        }

        return repository.save(updatedTopic);
    }

    @Override
    public List<TopicDTO> getAllTopics() {
        return repository.findAll().stream()
                .map(mapper::toTopicDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TopicDTO getTopicById(UUID id) {
        Topic topic = findLessonById(id);
        return mapper.toTopicDTO(topic);
    }

    @Override
    public List<TopicDTO> getTopicBySyllabusId(UUID sectionId) {
        return repository.findByModuleId(sectionId).stream()
                .map(mapper::toTopicDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteTopic(UUID id) {
        repository.deleteById(id);
    }

    // Helper Methods
    private Module findSectionById(UUID sectionId) {
        return moduleRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section with id: " + sectionId + " not found"));
    }

    private Topic findLessonById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new BadRequestException("Lesson with the provided ID does not exist"));
    }

    private boolean hasChanges(@NotNull Topic existingTopic, Topic updatedTopic, Module module) {
        return !Objects.equals(existingTopic, updatedTopic)
                || !Objects.equals(existingTopic.getModule().getId(), module.getId());
    }
}
