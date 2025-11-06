package com.example.courseService.service.impl;

import com.example.courseService.dto.request.CertificateRequest;
import com.example.courseService.dto.response.CertificateDTO;
import com.example.courseService.exception.implementation.BadRequestException;
import com.example.courseService.exception.implementation.NoChangesException;
import com.example.courseService.exception.implementation.ResourceNotFoundException;
import com.example.courseService.mapper.CertificateMapper;
import com.example.courseService.model.Certificate;
import com.example.courseService.model.Course;
import com.example.courseService.model.File;
import com.example.courseService.repository.CertificateRepository;
import com.example.courseService.repository.CourseRepository;
import com.example.courseService.service.CertificateService;
import com.example.courseService.service.StorageService;
import com.example.courseService.utils.HashChecksum;

import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository certificateRepository;
    private final StorageService azureBlobService;
    private final CourseRepository courseRepository;
    private final MessageSource messageSource;
    private final CertificateMapper certificateMapper;

    @Override
    public CertificateDTO createCertificate(@NotNull CertificateRequest request, MultipartFile file) throws IOException {
        validateFile(file);
        Locale locale = LocaleContextHolder.getLocale();

        Course course = getCourseById(request.getCourseId(), locale);
        File certUpload = azureBlobService.uploadFile(file);

        Certificate certificate = certificateMapper.toEntity(request, certUpload, course);
        certificateRepository.save(certificate);

        return certificateMapper.toDTO(certificate);
    }

    @Override
    public Certificate updateCertificate(UUID id, @NotNull CertificateRequest request, MultipartFile file) throws IOException {
        Locale locale = LocaleContextHolder.getLocale();

        Certificate existingCertificate = getCertificateById(id);
        validateFile(file);

        Course course = getCourseById(request.getCourseId(), locale);
        File certUpload = handleFileUpload(existingCertificate, file);

        Certificate updatedCertificate = certificateMapper.toEntity(request, certUpload, course);
        updatedCertificate.setId(id);

        if (!hasCertificateChanges(existingCertificate, updatedCertificate, certUpload)) {
            throw new NoChangesException(messageSource, locale);
        }

        return certificateRepository.save(updatedCertificate);
    }

    @Override
    public void deleteCertificate(UUID id) {
        certificateRepository.deleteById(id);
    }

    @Override
    public CertificateDTO getCertificate(UUID id) {
        Certificate certificate = getCertificateById(id);
        return certificateMapper.toDTO(certificate);
    }

    @Override
    public List<CertificateDTO> getCertificates() {
        return certificateRepository.findAll()
                .stream()
                .map(certificateMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Helper Methods

    private Certificate getCertificateById(UUID id) {
        return certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
    }

    private Course getCourseById(UUID courseId, Locale locale) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageSource.getMessage("course.notfound", new Object[]{courseId}, locale)));
    }

    private File handleFileUpload(Certificate existingCertificate, MultipartFile file) throws IOException {
        String checksum = HashChecksum.calculateFileChecksum(file);

        if (!existingCertificate.getCertificate().checkSumEquals(checksum)) {
            File uploadedFile = azureBlobService.uploadFile(file);
            if (existingCertificate.getCertificate() != null && existingCertificate.getCertificate().getName() != null) {
                azureBlobService.deleteFile(existingCertificate.getCertificate().getName());
            }
            return uploadedFile;
        }
        return existingCertificate.getCertificate();
    }

    private boolean hasCertificateChanges(Certificate existingCertificate, Certificate updatedCertificate, File certUpload) {
        return !existingCertificate.equals(updatedCertificate)
                || !existingCertificate.getCertificate().equals(certUpload);
    }

    private void validateFile(@NotNull MultipartFile file) {
        String contentType = file.getContentType();
        if (!isValidContentType(contentType)) {
            throw new BadRequestException("Invalid file type. Allowed types are pdf, docx, images.");
        }
    }

    private boolean isValidContentType(String contentType) {
        return contentType != null && (contentType.equals("application/pdf")
                || contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                || contentType.startsWith("image/"));
    }
}