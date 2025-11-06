package com.example.kafka.coursera.controllers;

import com.example.kafka.coursera.DTO.PostDTO;
import com.example.kafka.coursera.requests.PostRequest;
import com.example.kafka.coursera.services.PostService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@Validated
@RequestMapping("/api/post")
@RequiredArgsConstructor
@Tag(name = "post_method")
public class PostController {
    private final PostService service;

    @GetMapping
    public ResponseEntity<List<PostDTO>> findAllPost(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.findAllPost(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> findById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<?> createPost(@RequestPart("request") PostRequest request,
            @RequestPart(value = "picture", required = false) MultipartFile picture) throws IOException {
        try {
            return ResponseEntity.ok(service.createPost(request, picture));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.toString());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@RequestPart("request") PostRequest request,
            @RequestPart(value = "picture", required = false) MultipartFile picture, @PathVariable UUID id)
            throws IOException {
        try {
            return ResponseEntity.ok(service.updatePost(request, picture, id));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.toString());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable UUID id) {
        service.deletePost(id);
        return ResponseEntity.accepted().build();
    }
}
