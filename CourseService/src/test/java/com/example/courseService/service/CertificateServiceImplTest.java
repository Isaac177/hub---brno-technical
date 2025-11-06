//package com.example.courseService.service;
//
//import com.example.courseService.dto.request.CertificateRequest;
//import com.example.courseService.dto.response.CertificateDTO;
//import com.example.courseService.exception.implementation.BadRequestException;
//import com.example.courseService.exception.implementation.NoChangesException;
//import com.example.courseService.exception.implementation.ResourceNotFoundException;
//import com.example.courseService.mapper.CertificateMapper;
//import com.example.courseService.model.Certificate;
//import com.example.courseService.model.Course;
//import com.example.courseService.model.File;
//import com.example.courseService.repository.CertificateRepository;
//import com.example.courseService.repository.CourseRepository;
//import com.example.courseService.service.impl.CertificateServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.context.MessageSource;
//import org.springframework.mock.web.MockMultipartFile;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.util.List;
//import java.util.Locale;
//import java.util.Optional;
//import java.util.UUID;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//class CertificateServiceImplTest {
//
//    @Mock
//    private CertificateRepository certificateRepository;
//
//    @Mock
//    private StorageService azureBlobService;
//
//    @Mock
//    private CourseRepository courseRepository;
//
//    @Mock
//    private MessageSource messageSource;
//
//    @Mock
//    private CertificateMapper certificateMapper;
//
//    @Mock
//    private MultipartFile mockFile;
//
//    @InjectMocks
//    private CertificateServiceImpl certificateService;
//
//    private CertificateRequest certificateRequest;
//    private Certificate certificate;
//    private CertificateDTO certificateDTO;
//    private Course course;
//    private File uploadedFile;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        // Initialize test data
//        certificateRequest = new CertificateRequest();
//        certificateRequest.setCourseId(UUID.randomUUID());
//
//        certificate = new Certificate();
//        certificate.setId(UUID.randomUUID());
//        certificate.setCertificate(new File("", "", ""));
//
//        certificateDTO = new CertificateDTO();
//
//        course = new Course();
//        course.setId(certificateRequest.getCourseId());
//
//        uploadedFile = new File("fileName", "fileUrl", "checksum");
//        mockFile = new MockMultipartFile("file", "test.pdf", "application/pdf", "Some content".getBytes());
//
//    }
//
//    // Test createCertificate method - success
//    @Test
//    void testCreateCertificate_Success() throws IOException {
//        // Initialize mockFile as a MockMultipartFile with actual content
//        MultipartFile mockFile = new MockMultipartFile("file", "test.pdf", "application/pdf", "Some content".getBytes());
//
//        // Mock behaviors of other dependencies
//        when(courseRepository.findById(certificateRequest.getCourseId())).thenReturn(Optional.of(course));
//        when(azureBlobService.uploadFile(mockFile)).thenReturn(uploadedFile);
//        when(certificateMapper.toEntity(certificateRequest, uploadedFile, course)).thenReturn(certificate);
//        when(certificateMapper.toDTO(certificate)).thenReturn(certificateDTO);
//
//        // Call the method under test
//        CertificateDTO result = certificateService.createCertificate(certificateRequest, mockFile);
//
//        // Assertions and verifications
//        assertEquals(certificateDTO, result);
//        verify(certificateRepository).save(certificate);
//    }
//    // Test createCertificate method - invalid file type
//    @Test
//    void testCreateCertificate_InvalidFileType() {
//        // Mock the behavior of mockFile to return an invalid content type
//        MultipartFile mockFile = new MockMultipartFile("file", "test.txt", "text/plain", "Some content".getBytes());
//
//        // Ensure the course is present in the repository to prevent other exceptions
//        when(courseRepository.findById(certificateRequest.getCourseId())).thenReturn(Optional.of(course));
//
//        // Check for BadRequestException due to invalid file type
//        BadRequestException exception = assertThrows(BadRequestException.class, () ->
//                certificateService.createCertificate(certificateRequest, mockFile));
//
//        assertEquals("Invalid file type. Allowed types are pdf, docx, images.", exception.getMessage());
//    }
//
//    // Test updateCertificate method - success
//    @Test
//    void testUpdateCertificate_Success() throws IOException {
//        UUID certificateId = UUID.randomUUID();
//
//        // Initialize mockFile as a MockMultipartFile with actual content
//        MultipartFile mockFile = new MockMultipartFile("file", "test.pdf", "application/pdf", "Some content".getBytes());
//
//        // Mock behaviors of other dependencies
//        when(certificateRepository.findById(certificateId)).thenReturn(Optional.of(certificate));
//        when(courseRepository.findById(certificateRequest.getCourseId())).thenReturn(Optional.of(course));
//        when(azureBlobService.uploadFile(mockFile)).thenReturn(uploadedFile);
//        when(certificateMapper.toEntity(certificateRequest, uploadedFile, course)).thenReturn(certificate);
//        when(certificateRepository.save(certificate)).thenReturn(certificate);
//
//        // Call the method under test
//        Certificate result = certificateService.updateCertificate(certificateId, certificateRequest, mockFile);
//
//        // Assertions and verifications
//        assertEquals(certificate, result);
//        verify(certificateRepository).save(certificate);
//    }
//
//    // Test deleteCertificate method
//    @Test
//    void testDeleteCertificate_Success() {
//        UUID certificateId = UUID.randomUUID();
//
//        certificateService.deleteCertificate(certificateId);
//
//        verify(certificateRepository).deleteById(certificateId);
//    }
//
//    // Test getCertificate method - success
//    @Test
//    void testGetCertificate_Success() {
//        UUID certificateId = UUID.randomUUID();
//
//        when(certificateRepository.findById(certificateId)).thenReturn(Optional.of(certificate));
//        when(certificateMapper.toDTO(certificate)).thenReturn(certificateDTO);
//
//        CertificateDTO result = certificateService.getCertificate(certificateId);
//
//        assertEquals(certificateDTO, result);
//    }
//
//    // Test getCertificate method - certificate not found
//    @Test
//    void testGetCertificate_NotFound() {
//        UUID certificateId = UUID.randomUUID();
//
//        when(certificateRepository.findById(certificateId)).thenReturn(Optional.empty());
//
//        assertThrows(ResourceNotFoundException.class, () -> certificateService.getCertificate(certificateId));
//    }
//
//    // Test getCertificates method - success
//    @Test
//    void testGetCertificates_Success() {
//        List<Certificate> certificates = List.of(certificate);
//        List<CertificateDTO> certificateDTOs = List.of(certificateDTO);
//
//        when(certificateRepository.findAll()).thenReturn(certificates);
//        when(certificateMapper.toDTO(certificate)).thenReturn(certificateDTO);
//
//        List<CertificateDTO> result = certificateService.getCertificates();
//
//        assertEquals(certificateDTOs, result);
//    }
//}
