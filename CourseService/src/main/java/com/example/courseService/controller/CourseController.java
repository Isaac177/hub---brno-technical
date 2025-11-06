package com.example.courseService.controller;

import com.example.courseService.dto.request.BatchCourseRequest;
import com.example.courseService.dto.request.BatchCoursesBySchoolRequest;
import com.example.courseService.dto.request.CourseRequest;
import com.example.courseService.dto.request.UpdateCourseRequest;
import com.example.courseService.dto.response.BatchCourseResponse;
import com.example.courseService.dto.response.CourseDTO;
import com.example.courseService.dto.response.StudyStatisticsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.courseService.model.Course;
import com.example.courseService.service.CourseService;
import com.example.courseService.service.CourseSimilarityService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Tag(name = "course_controller")
@RestController
@RequestMapping("/api/courses")
@Validated
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CourseSimilarityService similarityService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createCourse(@RequestPart("courseRequest") @Valid CourseRequest courseRequest,
            @RequestPart(name = "featuredImage", required = false) MultipartFile featuredImage,
            @RequestPart(name = "thumbnail", required = false) MultipartFile thumbnail) {
        try {
            return new ResponseEntity<>(courseService.createCourse(courseRequest, featuredImage, thumbnail),
                    HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.toString());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(
            @PathVariable("id") UUID id,
            @RequestPart("courseRequest") @Valid UpdateCourseRequest updateCourseRequest,
            @RequestPart(name = "featuredImage", required = false) MultipartFile featuredImageFile,
            @RequestPart(name = "thumbnail", required = false) MultipartFile thumbnailFile) {

        try {
            CourseDTO updatedCourse = courseService.updateCourse(id, updateCourseRequest, featuredImageFile, thumbnailFile);
            return ResponseEntity.ok(updatedCourse);
        } catch (Exception e) {
            log.error("Error updating course {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(
            @PathVariable("id") UUID id) {
        return ResponseEntity.ok(courseService.getCourseDTObyId(id));

    }

    @GetMapping
    public Page<CourseDTO> getCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return courseService.getAllCourses(page, size);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable("id") UUID id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    // Updated method to get the cheapest courses with pagination
    @GetMapping("/cheapest")
    public ResponseEntity<Page<CourseDTO>> getCheapestCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(courseService.getCheapestCourses(pageable));
    }

    // pagination
    @GetMapping("/popular")
    public ResponseEntity<Page<CourseDTO>> getPopularCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(courseService.getPopularCourses(pageable));
    }

    @GetMapping("/shortest")
    public ResponseEntity<Page<CourseDTO>> getShortestCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);

        return ResponseEntity.ok(courseService.getShortestCourses(pageable));
    }

    @GetMapping("/{courseId}/recommendations")
    public Page<CourseDTO> getRecommendations(
            @PathVariable UUID courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return similarityService.getSimilarCourses(courseId, page, size);
    }

    @PostMapping("/batch")
    public ResponseEntity<BatchCourseResponse> getBatchCourses(
            @RequestBody @Valid BatchCourseRequest request) {
        BatchCourseResponse response = courseService.getBatchCourses(request.getCourseIds());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/school/batch")
    public ResponseEntity<BatchCourseResponse> getBatchCoursesBySchool(
            @RequestBody @Valid BatchCoursesBySchoolRequest request) {
        return ResponseEntity.ok(courseService.getBatchCoursesBySchool(request.getSchoolIds()));
    }

    @GetMapping("/countCoursesByInstructorId/{id}")
    public ResponseEntity<Long> getCountCoursesByInstructorId(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(courseService.countCoursesByInstructorId(id));
    }

    @GetMapping("/unified-statistics")
    public CompletableFuture<ResponseEntity<StudyStatisticsResponse>> getUnifiedStudyStatistics() {
        log.info("Received request for unified study statistics");
        return courseService.getUnifiedStudyStatistics()
                .thenApply(response -> {
                    if (response.isSuccess()) {
                        return ResponseEntity.ok(response);
                    } else {
                        log.error("Failed to collect unified statistics: {}", response.getError());
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                    }
                })
                .exceptionally(throwable -> {
                    log.error("Exception occurred while collecting unified statistics", throwable);
                    StudyStatisticsResponse errorResponse = StudyStatisticsResponse.error(
                            UUID.randomUUID(), 
                            "Internal server error: " + throwable.getMessage()
                    );
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                });
    }

}
