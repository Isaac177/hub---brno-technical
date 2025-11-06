package com.example.courseService.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.courseService.dto.request.ModuleRequest;
import com.example.courseService.dto.response.ModuleDTO;
import com.example.courseService.service.ModuleService;
import com.example.courseService.exception.implementation.BadRequestException;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/section")
@Validated
@RequiredArgsConstructor
public class SyllabusController {
    private final ModuleService service;

    @GetMapping
    public ResponseEntity<List<ModuleDTO>> getAllSections() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModuleDTO> getById(@PathVariable("id") UUID id) {

        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/byCourse/{courseId}")
    public ResponseEntity<?> getByCourse(@PathVariable("courseId") UUID id) {
        return ResponseEntity.ok(service.findByCourseId(id));
    }

    @PostMapping
    public ResponseEntity<?> postSection(@RequestBody @Valid ModuleRequest request) {
        return ResponseEntity.ok(service.createSyllabus(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSection(@RequestBody @Valid ModuleRequest request, @PathVariable("id") UUID id) {
        try {

            return ResponseEntity.ok(service.updateSyllabus(id, request));
        } catch (Exception e) {
            throw new BadRequestException(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") UUID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
