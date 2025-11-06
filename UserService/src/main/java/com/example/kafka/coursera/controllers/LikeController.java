package com.example.kafka.coursera.controllers;

import com.example.kafka.coursera.DTO.LikeDTO;
import com.example.kafka.coursera.requests.LikeRequest;
import com.example.kafka.coursera.services.LikeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/like")
@Tag(name = "like_method")
public class LikeController {
    private final LikeService service;

    @PostMapping
    public ResponseEntity<?> likePost(@RequestBody LikeRequest request) {
        try {
            return ResponseEntity.ok(service.likePost(request));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.toString());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLike(@PathVariable("id") UUID id) {
        service.deleteLike(id);
        return ResponseEntity.accepted().build();
    }
}
