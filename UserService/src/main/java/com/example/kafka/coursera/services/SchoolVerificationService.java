package com.example.kafka.coursera.services;

import com.example.kafka.coursera.DTO.SchoolVerificationDTO;
import com.example.kafka.coursera.FactoryDTOs.SchoolVerificationFactoryDTO;
import com.example.kafka.coursera.db.entities.SchoolVerification;
import com.example.kafka.coursera.db.enums.DocumentType;
import com.example.kafka.coursera.db.repositories.SchoolRepository;
import com.example.kafka.coursera.db.repositories.SchoolVerificationRepository;
import com.example.kafka.coursera.exceptions.implementation.ResourceNotFoundException;
import com.example.kafka.coursera.requests.SchoolVerificationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SchoolVerificationService {
    private final SchoolRepository schoolRepository;
    private final SchoolVerificationRepository repository;
    private final SchoolVerificationFactoryDTO factoryDTO;
    private final StorageService service;

    public SchoolVerificationDTO updateVerification(SchoolVerificationRequest request, MultipartFile document)
            throws IOException {
        var verification = repository.findBySchool(
                schoolRepository.findById(
                        UUID.fromString(request.getSchoolId()))
                        .orElseThrow(
                                () -> new ResourceNotFoundException(
                                        "school " + request.getSchoolId() + " doesnt exist")));
        mergeSchoolVerification(verification, request, document);
        verification.setSubmittedAt(Instant.now());
        verification = repository.save(verification);
        return factoryDTO.makeDTO(verification);
    }

    private void mergeSchoolVerification(SchoolVerification verification,
            SchoolVerificationRequest schoolVerificationDTO, MultipartFile document) throws IOException {
        verification.setDocumentType(DocumentType.valueOf(schoolVerificationDTO.getDocumentType()));
        verification.setDocument(service.uploadFile(document));
    }
}
