package com.example.courseService.service;

import com.example.courseService.dto.request.AssignmentRequest;
import com.example.courseService.dto.response.AssignmentDTO;

import java.util.List;
import java.util.UUID;

public interface AssignmentService {

    AssignmentDTO createAssignment(AssignmentRequest request);

    AssignmentDTO getAssignmentById(UUID id);

    List<AssignmentDTO> getAllAssignments();

    AssignmentDTO updateAssignment(UUID id, AssignmentRequest request);

    void deleteAssignment(UUID id);
}