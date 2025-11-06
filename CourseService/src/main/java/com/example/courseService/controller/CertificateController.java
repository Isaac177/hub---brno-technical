package com.example.courseService.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.courseService.dto.request.CertificateRequest;
import com.example.courseService.dto.response.CertificateDTO;
import com.example.courseService.model.Certificate;
import com.example.courseService.service.CertificateService;

import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/certificates")
@Validated
public class CertificateController {
    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createCertificate(
            @Valid @RequestPart("request") CertificateRequest request,
            @RequestPart("file") MultipartFile file) {
        try {
            CertificateDTO certificateDTO = certificateService.createCertificate(request, file);
            return ResponseEntity.ok(certificateDTO);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());

        }
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> updateCertificate(
            @PathVariable UUID id,
            @Valid @RequestPart("request") CertificateRequest request,
            @RequestPart("file") MultipartFile file) {
        try {
            Certificate certificateDTO = certificateService.updateCertificate(id, request, file);
            return ResponseEntity.ok(certificateDTO);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CertificateDTO> getCertificate(@PathVariable UUID id) {
        CertificateDTO certificateDTO = certificateService.getCertificate(id);
        return ResponseEntity.ok(certificateDTO);
    }

    @GetMapping
    public ResponseEntity<?> getCertificates() {
        List<CertificateDTO> lDtos = certificateService.getCertificates();
        return ResponseEntity.ok(lDtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCertificate(@PathVariable UUID id) {
        certificateService.deleteCertificate(id);
        return ResponseEntity.noContent().build();
    }
}
