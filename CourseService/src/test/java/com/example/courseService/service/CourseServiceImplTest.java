//package com.example.courseService.service;
//
//import com.example.courseService.dto.request.CourseRequest;
//import com.example.courseService.dto.response.CourseDTO;
//import com.example.courseService.exception.implementation.NoChangesException;
//import com.example.courseService.exception.implementation.ResourceNotFoundException;
//import com.example.courseService.mapper.CourseMapper;
//import com.example.courseService.model.Course;
//import com.example.courseService.model.File;
//import com.example.courseService.repository.CourseRepository;
//import com.example.courseService.service.StorageService;
//import com.example.courseService.service.impl.CourseServiceImpl;
//import com.example.courseService.utils.HashChecksum;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.context.MessageSource;
//import org.springframework.context.i18n.LocaleContextHolder;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//import org.springframework.mock.web.MockMultipartFile;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.sql.Timestamp;
//import java.util.*;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//class CourseServiceImplTest {
//
//    @Mock
//    private CourseRepository courseRepository;
//
//    @Mock
//    private CourseMapper courseMapper;
//
//    @Mock
//    private StorageService storageService;
//
//    @Mock
//    private MessageSource messageSource;
//
//
//    @InjectMocks
//    private CourseServiceImpl courseService;
//
//    private CourseRequest courseRequest;
//    private Course course;
//    private MultipartFile featuredImage;
//    private MultipartFile videoPromo;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        courseRequest = new CourseRequest();
//        courseRequest.setTranslations(new ArrayList<>()); // Add necessary fields for the request
//
//        course = new Course();
//        course.setId(UUID.randomUUID());
//        course.setTranslations(new ArrayList<>());
//        course.setCreatedAt(new Timestamp(System.currentTimeMillis()));
//        course.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
//
//        featuredImage = new MockMultipartFile("file", "test.pdf", "application/pdf", "Some content".getBytes());
//        videoPromo = new MockMultipartFile("file", "test.pdf", "application/pdf", "Some content".getBytes());
//
//
//    }
//
//    // Test createCourse method - success
//    @Test
//    void testCreateCourse_Success() throws IOException {
//        featuredImage = mock(MultipartFile.class);
//        videoPromo = mock(MultipartFile.class);
//        File featuredImageFile = new File();
//        File promoVideoFile = new File();
//
//        when(storageService.uploadFile(featuredImage)).thenReturn(featuredImageFile);
//        when(storageService.uploadFile(videoPromo)).thenReturn(promoVideoFile);
//        when(courseMapper.toEntity(courseRequest)).thenReturn(course);
//        when(courseRepository.save(any())).thenReturn(course);
//
//        Course result = courseService.createCourse(courseRequest, featuredImage, videoPromo);
//
//        assertNotNull(result);
//        assertEquals(course.getId(), result.getId());
//        assertEquals(featuredImageFile, result.getFeaturedImage());
//        assertEquals(promoVideoFile, result.getPromoVideo());
//        verify(courseRepository).save(result);
//    }
//
//    // Test createCourse method - IOException when uploading files
//    @Test
//    void testCreateCourse_FileUploadIOException() throws IOException {
//        featuredImage = mock(MultipartFile.class);
//        videoPromo = mock(MultipartFile.class);
//
//        when(storageService.uploadFile(featuredImage)).thenThrow(new IOException("Upload failed"));
//
//        assertThrows(IOException.class, () -> {
//            courseService.createCourse(courseRequest, featuredImage, videoPromo);
//        });
//    }
//
//    // Test updateCourse method - success
//    @Test
//    void testUpdateCourse_Success() throws IOException {
//        UUID courseId = course.getId();
//
//        MultipartFile newFeaturedImage = mock(MultipartFile.class);
//        MultipartFile newPromoVideo = mock(MultipartFile.class);
//
//        // Create mock File objects with proper checksums
//        File newFeaturedImageFile = new File("featuredImagePath", "featuredImageName", "featuredImageChecksum");
//        File newPromoVideoFile = new File("promoVideoPath", "promoVideoName", "promoVideoChecksum");
//
//        // Mock the behavior of Course update
//        Course updatedCourseEntity = new Course();
//        updatedCourseEntity.setId(courseId);
//        updatedCourseEntity.setFeaturedImage(newFeaturedImageFile);
//        updatedCourseEntity.setPromoVideo(newPromoVideoFile);
//
//        // Mocking repository and service calls
//        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
//        when(courseMapper.toEntity(courseRequest)).thenReturn(updatedCourseEntity);
//        when(storageService.uploadFile(featuredImage)).thenReturn(newFeaturedImageFile);
//        when(storageService.uploadFile(videoPromo)).thenReturn(newPromoVideoFile);
//        when(courseRepository.save(any(Course.class))).thenReturn(updatedCourseEntity);
//
//        // Call the service method
//        Course updatedCourse = courseService.updateCourse(courseId, courseRequest, featuredImage, videoPromo);
//
//        // Assertions
//        assertEquals(courseId, updatedCourse.getId());
//        assertEquals(newFeaturedImageFile, updatedCourse.getFeaturedImage());
//        assertEquals(newPromoVideoFile, updatedCourse.getPromoVideo());
//        verify(courseRepository).save(updatedCourseEntity);
//    }
//
//    // Test updateCourse method - course not found
//    @Test
//    void testUpdateCourse_CourseNotFound() {
//        UUID courseId = UUID.randomUUID();
//        when(courseRepository.findById(courseId)).thenReturn(Optional.empty());
//
//        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
//                courseService.updateCourse(courseId, courseRequest, null, null));
//
//        assertEquals("Course not found with id " + courseId, exception.getMessage());
//    }
//
//    // Test updateCourse method - no changes
//    @Test
//    void testUpdateCourse_NoChanges() {
//        UUID courseId = course.getId();
//        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
//        when(courseMapper.toEntity(courseRequest)).thenReturn(course);
//        when(messageSource.getMessage(anyString(), any(), any())).thenReturn("No changes detected.");
//
//        NoChangesException exception = assertThrows(NoChangesException.class, () ->
//                courseService.updateCourse(courseId, courseRequest, null, null));
//
//        assertEquals("No changes detected.", exception.getMessage());
//    }
//
//    // Test getCourseById method - success
//    @Test
//    void testGetCourseById_Success() {
//        UUID courseId = course.getId();
//        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
//
//        Course result = courseService.getCourseById(courseId);
//
//        assertEquals(course, result);
//    }
//
//    // Test getCourseById method - course not found
//    @Test
//    void testGetCourseById_NotFound() {
//        UUID courseId = UUID.randomUUID();
//        when(courseRepository.findById(courseId)).thenReturn(Optional.empty());
//
//        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
//                courseService.getCourseById(courseId));
//
//        assertEquals("Course not found with id " + courseId, exception.getMessage());
//    }
//
//    // Test getCourseDTObyId method - success
//    @Test
//    void testGetCourseDTObyId_Success() {
//        UUID courseId = course.getId();
//        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
//        when(courseMapper.toFullDTO(any(), any(), any())).thenReturn(new CourseDTO());
//
//        CourseDTO result = courseService.getCourseDTObyId(courseId);
//
//        assertNotNull(result);
//        verify(courseMapper).toFullDTO(any(), any(), any());
//    }
//
//    // Test getCourseDTObyId method - course not found
//    @Test
//    void testGetCourseDTObyId_NotFound() {
//        UUID courseId = UUID.randomUUID();
//        when(courseRepository.findById(courseId)).thenReturn(Optional.empty());
//
//        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
//                courseService.getCourseDTObyId(courseId));
//
//        assertEquals("Course not found with id " + courseId, exception.getMessage());
//    }
//
//    // Test deleteCourse method
//    @Test
//    void testDeleteCourse_Success() {
//        UUID courseId = UUID.randomUUID();
//        courseService.deleteCourse(courseId);
//
//        verify(courseRepository).deleteById(courseId);
//    }
//
//    // Test getAllCourses method
//    @Test
//    void testGetAllCourses_Success() {
//        Page<Course> coursePage = new PageImpl<>(List.of(course));
//        when(courseRepository.findAll(PageRequest.of(0, 10))).thenReturn(coursePage);
//        when(courseMapper.toDTO(any(Course.class), any())).thenReturn(new CourseDTO());
//
//        Page<CourseDTO> result = courseService.getAllCourses(0, 10);
//
//        assertNotNull(result);
//        assertEquals(1, result.getTotalElements());
//    }
//
//    // Test getCheapestCourses method
//    @Test
//    void testGetCheapestCourses_Success() {
//        Pageable pageable = PageRequest.of(0, 10);
//        Page<Course> coursePage = new PageImpl<>(List.of(course));
//        when(courseRepository.findAllByOrderByPriceAsc(pageable)).thenReturn(coursePage);
//        when(courseMapper.toDTO(any(Course.class), any())).thenReturn(new CourseDTO());
//
//        Page<CourseDTO> result = courseService.getCheapestCourses(pageable);
//
//        assertNotNull(result);
//        assertEquals(1, result.getTotalElements());
//    }
//
//    // Test getPopularCourses method
//    @Test
//    void testGetPopularCourses_Success() {
//        Pageable pageable = PageRequest.of(0, 10);
//        Page<Course> coursePage = new PageImpl<>(List.of(course));
//        when(courseRepository.findAllByOrderByEnrollmentCountDesc(pageable)).thenReturn(coursePage);
//        when(courseMapper.toDTO(any(Course.class), any())).thenReturn(new CourseDTO());
//
//        Page<CourseDTO> result = courseService.getPopularCourses(pageable);
//
//        assertNotNull(result);
//        assertEquals(1, result.getTotalElements());
//    }
//
//    // Test getShortestCourses method
//    @Test
//    void testGetShortestCourses_Success() {
//        Pageable pageable = PageRequest.of(0, 10);
//        Page<Course> coursePage = new PageImpl<>(List.of(course));
//        when(courseRepository.findAllByOrderByDurationInWeeksAsc(pageable)).thenReturn(coursePage);
//        when(courseMapper.toDTO(any(Course.class), any())).thenReturn(new CourseDTO());
//
//        Page<CourseDTO> result = courseService.getShortestCourses(pageable);
//
//        assertNotNull(result);
//        assertEquals(1, result.getTotalElements());
//    }
//
//    // Test countCoursesByInstructorId method
//    @Test
//    void testCountCoursesByInstructorId() {
//        UUID instructorId = UUID.randomUUID();
//        long count = 5;
//        when(courseRepository.countCoursesByInstructorId(instructorId)).thenReturn(count);
//
//        long result = courseService.countCoursesByInstructorId(instructorId);
//
//        assertEquals(count, result);
//    }
//}
