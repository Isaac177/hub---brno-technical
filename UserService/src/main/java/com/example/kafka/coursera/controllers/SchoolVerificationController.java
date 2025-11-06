package com.example.kafka.coursera.controllers;

import com.example.kafka.coursera.DTO.SchoolVerificationDTO;
import com.example.kafka.coursera.requests.SchoolVerificationRequest;
import com.example.kafka.coursera.services.SchoolVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/school/verification/")
@RequiredArgsConstructor
public class SchoolVerificationController {
    private final SchoolVerificationService service;

    @PutMapping
    public ResponseEntity<SchoolVerificationDTO> updateSchoolVerification(
            @RequestBody SchoolVerificationRequest request, @RequestParam("document") MultipartFile document)
            throws IOException {
        return ResponseEntity.ok(service.updateVerification(request, document));
    }
}
