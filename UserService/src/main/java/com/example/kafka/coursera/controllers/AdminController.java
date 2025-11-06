package com.example.kafka.coursera.controllers;

import com.example.kafka.coursera.DTO.SchoolDTO;
import com.example.kafka.coursera.db.entities.User;
import com.example.kafka.coursera.db.repositories.UserRepository;
import com.example.kafka.coursera.services.AdminService;
import com.example.kafka.coursera.services.SchoolService;
import com.example.kafka.coursera.services.TranslationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "admin_method")
public class AdminController {
    private final SchoolService schoolService;
    private final AdminService adminService;
    private final TranslationService translationService;
    private final UserRepository userRepository;

    @GetMapping("/school")
    public ResponseEntity<List<SchoolDTO>> getAllSchools() {
        return ResponseEntity.ok(schoolService.getAllSchools());
    }

    @GetMapping("/school/{id}")
    public ResponseEntity<SchoolDTO> getSchoolById(@PathVariable UUID id) {
        return ResponseEntity.ok(schoolService.getSchoolById(id));
    }

    @GetMapping("/pending/schools")
    public ResponseEntity<List<SchoolDTO>> getAllPendingSchools() {
        return ResponseEntity.ok(schoolService.getAllPendingSchool());
    }

    @PutMapping("/school/{id}/approve")
    public ResponseEntity<String> approveSchool(@PathVariable UUID id) {
        try {
            adminService.approveSchool(id);
            return ResponseEntity.ok("School approved successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/school/{id}/reject")
    public ResponseEntity<String> rejectSchool(@PathVariable UUID id) {
        try {
            adminService.rejectSchool(id);
            return ResponseEntity.ok("School rejected successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
