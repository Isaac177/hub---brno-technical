package com.example.kafka.coursera.controllers;

import com.example.kafka.coursera.DTO.CommentDTO;
import com.example.kafka.coursera.requests.CommentRequest;
import com.example.kafka.coursera.services.CommentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/comment")
@RequiredArgsConstructor
@Tag(name = "comment_method")
@Validated
public class CommentController {
    private final CommentService service;

    @PostMapping
    public ResponseEntity<?> sendComment(@RequestBody CommentRequest request) {
        try {
            return ResponseEntity.ok(service.sendComment(request));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(@RequestBody CommentRequest request, @PathVariable("id") UUID id) {
        try {
            return ResponseEntity.ok(service.updateComment(request, id));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.toString());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID id) {
        service.deleteComment(id);
        return ResponseEntity.accepted().build();
    }
}
