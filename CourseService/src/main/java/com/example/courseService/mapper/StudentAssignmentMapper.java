package com.example.courseService.mapper;

import com.example.courseService.dto.request.StudentAssignmentRequest;
import com.example.courseService.dto.response.StudentAssignmentDTO;
import com.example.courseService.model.Assignment;
import com.example.courseService.model.StudentAssignment;

public interface StudentAssignmentMapper {
    StudentAssignment toEntity(StudentAssignmentRequest request, Assignment assignment);

    StudentAssignmentDTO toResponse(StudentAssignment entity);
}
