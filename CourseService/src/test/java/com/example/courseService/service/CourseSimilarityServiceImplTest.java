//package com.example.courseService.service;
//
//import com.example.courseService.dto.response.CourseDTO;
//import com.example.courseService.enums.Level;
//import com.example.courseService.mapper.CourseMapper;
//import com.example.courseService.model.Course;
//import com.example.courseService.repository.CourseRepository;
//import com.example.courseService.service.impl.CourseSimilarityServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.context.i18n.LocaleContextHolder;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//
//import java.math.BigDecimal;
//import java.util.List;
//import java.util.Locale;
//import java.util.UUID;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//
//public class CourseSimilarityServiceImplTest {
//
//    @Mock
//    private CourseRepository courseRepository;
//
//    @Mock
//    private CourseMapper courseMapper;
//
//    @InjectMocks
//    private CourseSimilarityServiceImpl courseSimilarityService;
//
//    private Course baseCourse;
//    private Course similarCourse;
//    private UUID courseId;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        courseId = UUID.randomUUID();
//        baseCourse = Course.builder()
//                .id(courseId)
//                .translations(List.of(new CourseLocalization(UUID.randomUUID(), "en", "Title", "Description", "Short Description")))
//                .tags(List.of("java", "spring"))
//                .categoryId(UUID.randomUUID())
//                .level(Level.BEGINNER)
//                .price(BigDecimal.valueOf(100))
//                .instructors(List.of(UUID.randomUUID()))
//                .targetAudience("Developers")
//                .learningObjectives(List.of("Objective1", "Objective2"))
//                .averageRating(4.5f)
//                .schoolId(UUID.randomUUID())
//                .build();
//
//        similarCourse = Course.builder()
//                .id(UUID.randomUUID())
//                .translations(List.of(new CourseLocalization(UUID.randomUUID(), "en", "Similar Title", "Similar Description", "Short Description")))
//                .tags(List.of("java", "spring"))
//                .categoryId(baseCourse.getCategoryId())
//                .level(baseCourse.getLevel())
//                .price(baseCourse.getPrice())
//                .instructors(baseCourse.getInstructors())
//                .targetAudience(baseCourse.getTargetAudience())
//                .learningObjectives(baseCourse.getLearningObjectives())
//                .averageRating(baseCourse.getAverageRating())
//                .schoolId(baseCourse.getSchoolId())
//                .build();
//    }
//
//    @Test
//    void testGetSimilarCourses_Success() {
//        Locale locale = new Locale("en");
//        LocaleContextHolder.setLocale(locale);
//
//        Pageable pageable = PageRequest.of(0, 10);
//        List<Course> allCourses = List.of(baseCourse, similarCourse);
//
//        when(courseRepository.findById(courseId)).thenReturn(java.util.Optional.of(baseCourse));
//        when(courseRepository.findAll(pageable)).thenReturn(new PageImpl<>(allCourses));
//        when(courseMapper.toDTO(any(Course.class), eq(locale))).thenReturn(new CourseDTO());
//
//        Page<CourseDTO> result = courseSimilarityService.getSimilarCourses(courseId, 0, 10);
//
//        assertNotNull(result);
//        assertEquals(1, result.getTotalElements()); // Only the similar course should be returned
//        verify(courseMapper, times(1)).toDTO(any(Course.class), eq(locale));
//    }
//
//    @Test
//    void testGetSimilarCourses_CourseNotFound() {
//        when(courseRepository.findById(courseId)).thenReturn(java.util.Optional.empty());
//
//        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
//                courseSimilarityService.getSimilarCourses(courseId, 0, 10));
//
//        assertEquals("Course with ID " + courseId + " not found.", exception.getMessage());
//    }
//}