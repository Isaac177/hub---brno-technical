package com.example.courseService.controller;

import com.example.courseService.dto.request.CourseProgressRequest;
import com.example.courseService.dto.response.CourseProgressDTO;
import com.example.courseService.service.CourseProgressService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/course-progress")
@Validated
public class CourseProgressController {

    @Autowired
    private CourseProgressService service;

    @PostMapping
    public ResponseEntity<?> createCourseProgress(@Valid @RequestBody CourseProgressRequest request) {
        return new ResponseEntity<>(service.createCourseProgress(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourseProgress(
            @PathVariable UUID id,
            @Valid @RequestBody CourseProgressRequest request) {
        return new ResponseEntity<>(service.updateCourseProgress(id, request), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseProgressDTO> getCourseProgressById(@PathVariable UUID id,
            @RequestHeader(name = "Accept-Language", required = false) Locale requestLocale) {
        Locale locale = requestLocale != null ? requestLocale : LocaleContextHolder.getLocale();

        CourseProgressDTO dto = service.getCourseProgressById(id, locale);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourseProgress(@PathVariable UUID id) {
        service.deleteCourseProgress(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping
    public ResponseEntity<List<CourseProgressDTO>> getAllCourseProgress(
            @RequestHeader(name = "Accept-Language", required = false) Locale requestLocale) {
        Locale locale = requestLocale != null ? requestLocale : LocaleContextHolder.getLocale();
        List<CourseProgressDTO> dtos = service.getAllCourseProgress(locale);
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }
}
