package com.example.courseService.service;

import com.example.courseService.dto.request.ModuleRequest;
import com.example.courseService.dto.response.ModuleDTO;

import java.util.List;
import java.util.UUID;

public interface ModuleService {
    List<ModuleDTO> findAll();

    ModuleDTO findById(UUID id);

    List<ModuleDTO> findByCourseId(UUID id);

    ModuleDTO createSyllabus(ModuleRequest request);

    ModuleDTO updateSyllabus(UUID id, ModuleRequest request);

    void deleteById(UUID id);
}
