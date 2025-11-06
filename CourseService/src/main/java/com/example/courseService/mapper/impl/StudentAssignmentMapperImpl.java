package com.example.courseService.mapper.impl;

import com.example.courseService.dto.request.StudentAssignmentRequest;
import com.example.courseService.dto.response.StudentAssignmentDTO;
import com.example.courseService.mapper.StudentAssignmentMapper;
import com.example.courseService.model.Assignment;
import com.example.courseService.model.StudentAssignment;

import java.time.Instant;

import org.springframework.stereotype.Component;

@Component
public class StudentAssignmentMapperImpl implements StudentAssignmentMapper {
    @Override
    public StudentAssignment toEntity(StudentAssignmentRequest request, Assignment assignment) {
        return StudentAssignment.builder()
                .assignment(assignment)
                .studentId(request.getStudentId())
                .submittedTime(Instant.now())
                .textInput(request.getTextInput())
                .build();
    }
    @Override
    public StudentAssignmentDTO toResponse(StudentAssignment entity) {
        return StudentAssignmentDTO.builder()
                .id(entity.getId())
                .assignmentId(entity.getAssignment().getId())
                .studentId(entity.getStudentId())
                .points(entity.getPoints())
                .submittedTime(entity.getSubmittedTime())
                .attempts(entity.getAttempts())
                .textInput(entity.getTextInput())
                .file(entity.getFile() != null ? entity.getFile() : null)
                .build();
    }
}
