package com.example.courseService.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.courseService.dto.request.TopicRequest;
import com.example.courseService.service.TopicService;

@Validated
@RestController
@RequestMapping("/api/lesson")
@Tag(name = "lesson_controller")
@RequiredArgsConstructor

public class TopicController {
    private final TopicService service;

    @GetMapping
    public ResponseEntity<?> getAllLessons() {
        return ResponseEntity.ok(service.getAllTopics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLessonById(@PathVariable("id") @NotNull UUID id) {
        return ResponseEntity.ok(service.getTopicById(id));
    }

    @GetMapping("/bySection/{sectionId}")
    public ResponseEntity<?> getLessonBySectionId(@PathVariable("sectionId") @NotNull UUID sectionId) {
        return ResponseEntity.ok(service.getTopicBySyllabusId(sectionId));
    }

    @PostMapping
    public ResponseEntity<?> postLesson(@Valid @RequestBody TopicRequest request) {
        return ResponseEntity.ok(service.createTopic(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLesson(@Valid @RequestBody TopicRequest request, @PathVariable("id") UUID id) {
        return ResponseEntity.ok(service.updateTopic(request, id));
    }
}
