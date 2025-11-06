package com.example.courseService.service;


import com.example.courseService.dto.request.CertificateRequest;
import com.example.courseService.dto.response.CertificateDTO;
import com.example.courseService.model.Certificate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface CertificateService {

    CertificateDTO createCertificate(CertificateRequest request, MultipartFile file) throws IOException;

    Certificate updateCertificate(UUID id, CertificateRequest request, MultipartFile file) throws IOException;

    void deleteCertificate(UUID id);

    CertificateDTO getCertificate(UUID id);

    List<CertificateDTO> getCertificates();
}