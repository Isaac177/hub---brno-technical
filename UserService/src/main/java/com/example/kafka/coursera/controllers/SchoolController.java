package com.example.kafka.coursera.controllers;

import com.example.kafka.coursera.requests.SchoolRequest;
import com.example.kafka.coursera.services.SchoolService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/school")
@RequiredArgsConstructor
@Tag(name = "school_method")
@Validated
public class SchoolController {
    private static final Logger log = LoggerFactory.getLogger(SchoolController.class);
    private final SchoolService service;

    @GetMapping
    public ResponseEntity<?> getAllSchools() {
        var schools = service.getAllSchools();
        return ResponseEntity.ok(schools);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(service.getSchoolById(id));
    }

    @PostMapping
    public ResponseEntity<?> signUpSchool(@RequestPart("request") SchoolRequest request,
            @RequestParam(value = "logo", required = false) MultipartFile logo) {
        try {
            return ResponseEntity.ok()
                    .body(service.createSchool(request, logo));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.toString());
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateSchool(@RequestPart("request") SchoolRequest request,
            @RequestPart(value = "logo", required = false) MultipartFile logo,
            @PathVariable("id") UUID id) {
        try {

            return ResponseEntity.ok()
                    .body(service.updateSchool(request, logo, id));

        } catch (Exception e) {
            log.error("Error updating school {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.toString());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchool(@PathVariable("id") UUID id) {
        try {
            service.deleteSchool(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting school: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
