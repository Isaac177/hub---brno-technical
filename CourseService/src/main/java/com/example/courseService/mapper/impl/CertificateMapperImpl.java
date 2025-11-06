package com.example.courseService.mapper.impl;

import java.time.LocalDateTime;
import java.util.UUID;

import com.example.courseService.dto.request.CertificateRequest;
import com.example.courseService.dto.response.CertificateDTO;
import com.example.courseService.mapper.CertificateMapper;
import com.example.courseService.model.Certificate;
import com.example.courseService.model.Course;
import com.example.courseService.model.File;
import org.springframework.stereotype.Component;

@Component
public class CertificateMapperImpl implements CertificateMapper {
    @Override
    public Certificate toEntity(CertificateRequest request, File certificateFile, Course course) {
        return Certificate.builder()
                .id(UUID.randomUUID())
                .course(course)
                .userId(request.getUserId())
                .issueDate(LocalDateTime.now())
                .certificate(certificateFile)
                .verificationCode(request.getVerificationCode())
                .build();
    }
    @Override
    public CertificateDTO toDTO(Certificate certificate) {
        return CertificateDTO.builder()
                .id(certificate.getId())
                .courseId(certificate.getCourse().getId())
                .userId(certificate.getUserId())
                .issueDate(certificate.getIssueDate())
                .certificateUrl(certificate.getCertificate().getUrl())
                .verificationCode(certificate.getVerificationCode())
                .build();
    }
}
