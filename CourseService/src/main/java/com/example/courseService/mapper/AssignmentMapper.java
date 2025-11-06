package com.example.courseService.mapper;

import com.example.courseService.dto.request.AssignmentRequest;
import com.example.courseService.dto.response.AssignmentDTO;
import com.example.courseService.model.Assignment;
import com.example.courseService.model.Module;

public interface AssignmentMapper {

    Assignment toEntity(AssignmentRequest request, Module module);

    AssignmentDTO toResponse(Assignment assignment);
}
