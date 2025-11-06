package com.example.courseService.service;

import com.example.courseService.dto.request.CourseRequest;
import com.example.courseService.dto.request.UpdateCourseRequest;
import com.example.courseService.dto.response.BatchCourseResponse;
import com.example.courseService.dto.response.CourseDTO;
import com.example.courseService.model.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import com.example.courseService.dto.response.StudyStatisticsResponse;

public interface CourseService {

        CourseDTO createCourse(CourseRequest courseRequest, MultipartFile featuredImage, MultipartFile videoPromo)
                        throws IOException;

        CourseDTO updateCourse(UUID id, UpdateCourseRequest updateCourseRequest, MultipartFile newFeaturedImage,
                        MultipartFile newThumbnail);

        Course getCourseById(UUID id);

        CourseDTO getCourseDTObyId(UUID id);

        Page<CourseDTO> getAllCourses(int page, int size);

        void deleteCourse(UUID id);

        void deleteAllCoursesBySchoolId(UUID schoolId);

        Page<CourseDTO> getCheapestCourses(Pageable pageable);

        Page<CourseDTO> getPopularCourses(Pageable pageable);

        Page<CourseDTO> getShortestCourses(Pageable pageable);

        long countCoursesByInstructorId(UUID instructorId);

        BatchCourseResponse getBatchCourses(List<UUID> courseIds);

        BatchCourseResponse getBatchCoursesBySchool(List<UUID> schoolIds);

        boolean hasCoursesForSchool(UUID schoolId);

        List<Map<String, Object>> getCoursesBySchoolId(UUID schoolId);
        
        List<Map<String, Object>> getCoursesBySchoolIdWithDetails(UUID schoolId);

        List<Map<String, Object>> getCoursesByInstructorIdWithDetails(UUID instructorId);
        
        CompletableFuture<StudyStatisticsResponse> getUnifiedStudyStatistics();
}