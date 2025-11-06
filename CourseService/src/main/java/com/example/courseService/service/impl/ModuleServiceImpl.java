package com.example.courseService.service.impl;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import com.example.courseService.dto.request.ModuleRequest;
import com.example.courseService.model.Module;
import com.example.courseService.service.CourseService;
import com.example.courseService.service.ModuleService;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import com.example.courseService.dto.response.ModuleDTO;
import com.example.courseService.repository.ModuleRepository;
import com.example.courseService.exception.implementation.NoChangesException;
import com.example.courseService.exception.implementation.ResourceNotFoundException;
import com.example.courseService.mapper.ModuleMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class ModuleServiceImpl implements ModuleService {
    private final CourseService cService;
    private final ModuleRepository repository;
    private final MessageSource messageSource;
    private final ModuleMapper moduleMapper;

    @Override
    public List<ModuleDTO> findAll() {
        return moduleMapper.toDtoList(repository.findAll());
    }

    @Override
    public ModuleDTO findById(UUID id) {
        Module module = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existing section with id: " + id));

        return moduleMapper.toDto(module);
    }

    @Override
    public List<ModuleDTO> findByCourseId(UUID id) {
        List<Module> syllabi = repository.findByCourseId(id);
        return moduleMapper.toDtoList(syllabi);
    }

    @Override
    public ModuleDTO createSyllabus(ModuleRequest request) {
        var course = cService.getCourseById(request.getCourseId());
        if(course == null) {
            throw new ResourceNotFoundException("No existing section with id: " + request.getCourseId());
        }
        Module module = moduleMapper.toEntity(request, course);

        return moduleMapper.toDto(repository.save(module));
    }

    @Override
    public ModuleDTO updateSyllabus(UUID id, ModuleRequest request) {
        Locale locale = LocaleContextHolder.getLocale();
        Module oldModule = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section with ID: " + id + " not found"));
        
        var course = cService.getCourseById(request.getCourseId());
        if(course == null) {
            throw new ResourceNotFoundException("No existing section with id: " + request.getCourseId());
        }
        Module newModule = moduleMapper.toEntity(request, course);

        boolean hasChanges = !oldModule.equals(newModule);

        if (!hasChanges) {
            throw new NoChangesException(messageSource, locale);
        }

        newModule.setCourse(oldModule.getCourse());

        return moduleMapper.toDto(repository.save(oldModule));
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
