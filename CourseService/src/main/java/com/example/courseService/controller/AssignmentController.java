package com.example.courseService.controller;

import com.example.courseService.dto.request.AssignmentRequest;
import com.example.courseService.dto.response.AssignmentDTO;
import com.example.courseService.service.AssignmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @PostMapping
    public ResponseEntity<AssignmentDTO> createAssignment(@Valid @RequestBody AssignmentRequest request) {
        AssignmentDTO response = assignmentService.createAssignment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<?> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentDTO> getAssignmentById(@PathVariable UUID id) {
        AssignmentDTO response = assignmentService.getAssignmentById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssignmentDTO> updateAssignment(@PathVariable UUID id,
            @Valid @RequestBody AssignmentRequest request) {
        AssignmentDTO response = assignmentService.updateAssignment(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable UUID id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }
}
