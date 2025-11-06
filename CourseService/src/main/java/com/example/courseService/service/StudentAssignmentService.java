package com.example.courseService.service;

import com.example.courseService.dto.request.StudentAssignmentRequest;
import com.example.courseService.dto.response.StudentAssignmentDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface StudentAssignmentService {
    List<StudentAssignmentDTO> getAllAssignments();

    List<StudentAssignmentDTO> getAssignmentsByLessonId(UUID assignmentId);

    StudentAssignmentDTO getAssignmentById(UUID id);

    StudentAssignmentDTO createAssignment(StudentAssignmentRequest request, MultipartFile file);

    StudentAssignmentDTO updateAssignment(UUID id, StudentAssignmentRequest request, MultipartFile file);

    void deleteAssignment(UUID id);
}
