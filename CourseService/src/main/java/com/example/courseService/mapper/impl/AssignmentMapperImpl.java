package com.example.courseService.mapper.impl;

import com.example.courseService.dto.request.AssignmentRequest;
import com.example.courseService.dto.response.AssignmentDTO;
import com.example.courseService.mapper.AssignmentMapper;
import com.example.courseService.model.Assignment;
import com.example.courseService.model.Module;

import org.springframework.stereotype.Component;

@Component
public class AssignmentMapperImpl implements AssignmentMapper {

    @Override
    public Assignment toEntity(AssignmentRequest request, Module module) {
        return Assignment.builder()
                .module(module)
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .maxScore(request.getMaxScore())
                .assignmentFormat(request.getFormat())
                .attempts(request.getAttempts())
                .build();
    }
    @Override
    public AssignmentDTO toResponse(Assignment assignment) {
        return AssignmentDTO.builder()
                .id(assignment.getId())
                .sectionId(assignment.getModule().getId())
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .dueDate(assignment.getDueDate())
                .maxScore(assignment.getMaxScore())
                .attempts(assignment.getAttempts())
                .format(assignment.getAssignmentFormat())
                .build();
    }
}
