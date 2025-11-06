package com.example.courseService.mapper;

import com.example.courseService.dto.request.CertificateRequest;
import com.example.courseService.dto.response.CertificateDTO;
import com.example.courseService.model.Certificate;
import com.example.courseService.model.Course;
import com.example.courseService.model.File;

public interface CertificateMapper {
    Certificate toEntity(CertificateRequest request, File certificateFile, Course course);

    CertificateDTO toDTO(Certificate certificate);
}
