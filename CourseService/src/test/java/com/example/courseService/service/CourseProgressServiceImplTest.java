//package com.example.courseService.service;
//
//import com.example.courseService.dto.request.CourseProgressRequest;
//import com.example.courseService.dto.response.CourseProgressDTO;
//import com.example.courseService.exception.implementation.ResourceNotFoundException;
//import com.example.courseService.mapper.CourseProgressMapper;
//import com.example.courseService.model.Course;
//import com.example.courseService.model.CourseProgress;
//import com.example.courseService.model.Topic;
//import com.example.courseService.repository.CourseProgressRepository;
//import com.example.courseService.repository.CourseRepository;
//import com.example.courseService.repository.TopicRepository;
//import com.example.courseService.service.impl.CourseProgressServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.context.MessageSource;
//import org.springframework.context.i18n.LocaleContextHolder;
//
//import java.util.*;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//class CourseProgressServiceImplTest {
//
//    @Mock
//    private CourseProgressRepository repository;
//
//    @Mock
//    private CourseProgressMapper mapper;
//
//    @Mock
//    private TopicRepository topicRepository;
//
//    @Mock
//    private CourseRepository courseRepository;
//
//    @Mock
//    private MessageSource messageSource;
//
//    @InjectMocks
//    private CourseProgressServiceImpl courseProgressService;
//
//    private CourseProgressRequest request;
//    private Course course;
//    private Topic topic;
//    private CourseProgress courseProgress;
//    private CourseProgressDTO courseProgressDTO;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        // Initialize test data
//        request = new CourseProgressRequest();
//        request.setCourseId(UUID.randomUUID());
//        request.setLastAccessedLessonId(UUID.randomUUID());
//        request.setCompletedLessons(new HashSet<>(List.of(UUID.randomUUID(), UUID.randomUUID())));
//
//        course = new Course();
//        course.setId(request.getCourseId());
//
//        topic = new Topic();
//        topic.setId(request.getLastAccessedLessonId());
//
//        courseProgress = new CourseProgress();
//        courseProgress.setId(UUID.randomUUID());
//
//        courseProgressDTO = new CourseProgressDTO();
//    }
//
//    // Test createCourseProgress method - success
//    @Test
//    void testCreateCourseProgress_Success() {
//        when(courseRepository.findById(request.getCourseId())).thenReturn(Optional.of(course));
//        when(topicRepository.findById(request.getLastAccessedLessonId())).thenReturn(Optional.of(topic));
//        when(topicRepository.findAllById(request.getCompletedLessons())).thenReturn(new ArrayList<>(List.of(topic)));
//        when(mapper.toEntity(request, Set.of(topic), topic, course)).thenReturn(courseProgress);
//        when(repository.save(courseProgress)).thenReturn(courseProgress);
//
//        CourseProgress result = courseProgressService.createCourseProgress(request);
//
//        assertEquals(courseProgress, result);
//        verify(repository).save(courseProgress);
//    }
//
//    // Test createCourseProgress method - course not found
//    @Test
//    void testCreateCourseProgress_CourseNotFound() {
//        when(courseRepository.findById(request.getCourseId())).thenReturn(Optional.empty());
//        when(messageSource.getMessage(anyString(), any(), any())).thenReturn("course.not.found");
//
//        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
//                courseProgressService.createCourseProgress(request));
//
//        assertEquals("course.not.found", exception.getMessage());
//    }
//
//    // Test createCourseProgress method - lesson not found
//    @Test
//    void testCreateCourseProgress_LessonNotFound() {
//        when(courseRepository.findById(request.getCourseId())).thenReturn(Optional.of(course));
//        when(topicRepository.findById(request.getLastAccessedLessonId())).thenReturn(Optional.empty());
//        when(messageSource.getMessage(anyString(), any(), any())).thenReturn("lesson.not.found");
//
//        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
//                courseProgressService.createCourseProgress(request));
//
//        assertEquals("lesson.not.found", exception.getMessage());
//    }
//
//    // Test updateCourseProgress method - success
//    @Test
//    void testUpdateCourseProgress_Success() {
//        UUID progressId = UUID.randomUUID();
//        CourseProgress updateCourseProgress = new CourseProgress();
//        updateCourseProgress.setId(progressId);
//
//        when(repository.findById(progressId)).thenReturn(Optional.of(courseProgress));
//        when(courseRepository.findById(request.getCourseId())).thenReturn(Optional.of(course));
//        when(topicRepository.findById(request.getLastAccessedLessonId())).thenReturn(Optional.of(topic));
//        when(topicRepository.findAllById(request.getCompletedLessons())).thenReturn(new ArrayList<>(List.of(topic)));
//        when(mapper.toEntity(request, Set.of(topic), topic, course)).thenReturn(updateCourseProgress);
//
//        when(repository.save(updateCourseProgress)).thenReturn(updateCourseProgress);
//
//        CourseProgress result = courseProgressService.updateCourseProgress(progressId, request);
//
//        assertEquals(updateCourseProgress, result);
//        verify(repository).save(updateCourseProgress);
//    }
//
//    // Test updateCourseProgress method - course progress not found
//    @Test
//    void testUpdateCourseProgress_ProgressNotFound() {
//        UUID progressId = UUID.randomUUID();
//        when(repository.findById(progressId)).thenReturn(Optional.empty());
//
//        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
//                courseProgressService.updateCourseProgress(progressId, request));
//
//        assertEquals("CourseProgress not found with id: " + progressId, exception.getMessage());
//    }
//
//    // Test getCourseProgressById method - success
//    @Test
//    void testGetCourseProgressById_Success() {
//        UUID progressId = UUID.randomUUID();
//        when(repository.findById(progressId)).thenReturn(Optional.of(courseProgress));
//        when(mapper.toDTO(courseProgress, LocaleContextHolder.getLocale())).thenReturn(courseProgressDTO);
//
//        CourseProgressDTO result = courseProgressService.getCourseProgressById(progressId, LocaleContextHolder.getLocale());
//
//        assertEquals(courseProgressDTO, result);
//    }
//
//    // Test getCourseProgressById method - progress not found
//    @Test
//    void testGetCourseProgressById_NotFound() {
//        UUID progressId = UUID.randomUUID();
//        when(repository.findById(progressId)).thenReturn(Optional.empty());
//
//        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
//                courseProgressService.getCourseProgressById(progressId, LocaleContextHolder.getLocale()));
//
//        assertEquals("CourseProgress not found with id: " + progressId, exception.getMessage());
//    }
//
//    // Test deleteCourseProgress method
//    @Test
//    void testDeleteCourseProgress_Success() {
//        UUID progressId = UUID.randomUUID();
//        courseProgressService.deleteCourseProgress(progressId);
//
//        verify(repository).deleteById(progressId);
//    }
//
//    // Test getAllCourseProgress method - success
//    @Test
//    void testGetAllCourseProgress_Success() {
//        List<CourseProgress> courseProgressList = List.of(courseProgress);
//        List<CourseProgressDTO> courseProgressDTOList = List.of(courseProgressDTO);
//
//        when(repository.findAll()).thenReturn(courseProgressList);
//        when(mapper.toDTO(courseProgress, LocaleContextHolder.getLocale())).thenReturn(courseProgressDTO);
//
//        List<CourseProgressDTO> result = courseProgressService.getAllCourseProgress(LocaleContextHolder.getLocale());
//
//        assertEquals(courseProgressDTOList, result);
//    }
//}
