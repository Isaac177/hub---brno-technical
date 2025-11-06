package com.example.kafka.coursera.controllers;

import com.example.kafka.coursera.DTO.SchoolDTO;
import com.example.kafka.coursera.services.SchoolService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/main")
@RequiredArgsConstructor
@Tag(name = "main_method")
public class MainController {
    private final SchoolService service;

    @GetMapping
    public ResponseEntity<List<SchoolDTO>> getAllSchools() {
        return ResponseEntity.ok(service.getAllSchools());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SchoolDTO> getSchoolById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getSchoolById(id));
    }

}
