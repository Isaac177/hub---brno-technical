package com.example.courseService.controller;

import com.example.courseService.dto.request.ResourceRequest;
import com.example.courseService.dto.response.ResourceDTO;
import com.example.courseService.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/resources")
@RequiredArgsConstructor
public class ResourceController {
    private final ResourceService resourceService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ResourceDTO> createResource(
            @Valid @RequestPart(name = "resourceRequest") ResourceRequest request,
            @RequestPart(name = "files", required = false) List<MultipartFile> files) {
        ResourceDTO responseDTO = resourceService.createResource(request);
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getResourceById(@PathVariable UUID id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @GetMapping("/byLesson/{lessonId}")
    public ResponseEntity<?> getByLessonId(@PathVariable("lessonId") UUID id) {
        return ResponseEntity.ok(resourceService.getByLessonId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceDTO> updateResource(@PathVariable UUID id,
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable UUID id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
