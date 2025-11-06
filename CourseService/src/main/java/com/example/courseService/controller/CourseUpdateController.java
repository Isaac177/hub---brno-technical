package com.example.courseService.controller;

import com.example.courseService.dto.*;
import com.example.courseService.service.CourseUpdateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/courses/{courseId}")
@RequiredArgsConstructor
@Validated
public class CourseUpdateController {

    private final CourseUpdateService courseUpdateService;

    @PostMapping("/media/{mediaType}")
    public ResponseEntity<Map<String, String>> uploadMedia(
            @PathVariable String courseId,
            @PathVariable String mediaType,
            @RequestPart MultipartFile file) {
        String mediaUrl = courseUpdateService.initializeMediaUpload(courseId, mediaType, (MediaUploadRequest) file);
        return ResponseEntity.ok(Map.of("mediaUrl", mediaUrl));
    }

    @PostMapping("/media/{mediaType}/init")
    public ResponseEntity<Map<String, String>> initializeMediaUpload(
            @PathVariable String courseId,
            @PathVariable String mediaType,
            @Valid @RequestBody MediaUploadRequest request) {
        String uploadToken = courseUpdateService.initializeMediaUpload(courseId, mediaType, request);
        return ResponseEntity.ok(Map.of("uploadToken", uploadToken));
    }

    @PostMapping("/media/{mediaType}/complete")
    public ResponseEntity<Map<String, String>> completeMediaUpload(
            @PathVariable String courseId,
            @PathVariable String mediaType,
            @RequestParam String uploadToken) {
        String mediaUrl = courseUpdateService.completeMediaUpload(uploadToken);
        return ResponseEntity.ok(Map.of("mediaUrl", mediaUrl));
    }

    @PutMapping("/data")
    public ResponseEntity<Void> updateCourseData(
            @PathVariable String courseId,
            @Valid @RequestBody CourseUpdateRequest request) {
        courseUpdateService.updateCourseData(courseId, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/syllabus")
    public ResponseEntity<Void> updateCourseSyllabus(
            @PathVariable String courseId,
            @Valid @RequestBody SyllabusUpdateRequest request) {
        courseUpdateService.updateCourseSyllabus(courseId, request);
        return ResponseEntity.ok().build();
    }
}
