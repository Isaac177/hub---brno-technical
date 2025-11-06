package com.example.courseService.mapper;

import com.example.courseService.dto.request.ModuleRequest;
import com.example.courseService.dto.response.ModuleDTO;
import com.example.courseService.model.Course;
import com.example.courseService.model.Module;

import java.util.List;

public interface ModuleMapper {
    Module toEntity(ModuleRequest moduleRequest, Course course);

    ModuleDTO toDto(Module module);

    List<ModuleDTO> toDtoList(List<Module> syllabus);
}
