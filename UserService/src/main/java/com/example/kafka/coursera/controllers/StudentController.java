package com.example.kafka.coursera.controllers;

import com.example.kafka.coursera.requests.StudentProfileRequest;
import com.example.kafka.coursera.services.StudentService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@Validated
public class StudentController {
    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<?> getAllStudents() {
        return ResponseEntity.ok(studentService.findAllStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentByID(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PutMapping
    public ResponseEntity<?> updateStudentProfile(@RequestPart("request") StudentProfileRequest request,
            @RequestPart(value = "file", required = false) MultipartFile picture) {
        try {
            return ResponseEntity.ok()
                    .body(studentService.updateProfile(request, picture));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.toString());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable("id") UUID id, @RequestBody @NotBlank String email) {
        try {
            studentService.delete(id, email);
            return ResponseEntity.ok("Successfully deleted");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.toString());
        }
    }
}
