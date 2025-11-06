package com.example.courseService.controller;

import com.example.courseService.dto.request.StudentAssignmentRequest;
import com.example.courseService.dto.response.StudentAssignmentDTO;
import com.example.courseService.service.StudentAssignmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/student-assignments")
@RequiredArgsConstructor
@Validated
public class StudentAssignmentController {
    private final MessageSource messageSource;
    private final StudentAssignmentService studentAssignmentService;

    @GetMapping
    public ResponseEntity<List<StudentAssignmentDTO>> getAllStudentAssignments() {
        List<StudentAssignmentDTO> assignments = studentAssignmentService.getAllAssignments();
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentAssignmentDTO> getStudentAssignmentById(@PathVariable UUID id) {
        StudentAssignmentDTO assignment = studentAssignmentService.getAssignmentById(id);
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/by-assignment/{assignmentId}")
    public ResponseEntity<List<StudentAssignmentDTO>> getAssignmentsByLessonId(@PathVariable UUID assignmentId) {
        List<StudentAssignmentDTO> assignments = studentAssignmentService.getAssignmentsByLessonId(assignmentId);
        return ResponseEntity.ok(assignments);
    }

    @PostMapping
    public ResponseEntity<?> createStudentAssignment(@RequestPart("request") @Valid StudentAssignmentRequest request,
            @RequestPart(name = "file", required = false) MultipartFile file) {
        try {
            StudentAssignmentDTO createdAssignment = studentAssignmentService.createAssignment(request, file);
            return new ResponseEntity<>(createdAssignment, HttpStatus.CREATED);
        } catch (DuplicateKeyException e) {
            return ResponseEntity.badRequest().body(messageSource.getMessage("studentAssignment.alreadyCreated",
                    new Object[] { request.getStudentId() }, LocaleContextHolder.getLocale()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentAssignmentDTO> updateStudentAssignment(
            @PathVariable UUID id,
            @RequestPart("request") StudentAssignmentRequest request,
            @RequestPart(name = "file", required = false) MultipartFile file) {
        StudentAssignmentDTO updatedAssignment = studentAssignmentService.updateAssignment(id, request, file);
        return ResponseEntity.ok(updatedAssignment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudentAssignment(@PathVariable UUID id) {
        studentAssignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }
}
