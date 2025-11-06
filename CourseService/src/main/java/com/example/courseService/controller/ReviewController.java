package com.example.courseService.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.courseService.dto.request.ReviewRequest;
import com.example.courseService.dto.response.ReviewDTO;
import com.example.courseService.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Validated
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ReviewDTO createReview(@RequestBody @Valid ReviewRequest request) {
        return reviewService.createReview(request);
    }

    @PutMapping("/{id}")
    public ReviewDTO updateReview(@PathVariable UUID id, @RequestBody @Valid ReviewRequest request) {
        return reviewService.updateReview(id, request);
    }

    @GetMapping("/{id}")
    public ReviewDTO getReview(@PathVariable UUID id) {
        return reviewService.getReviewById(id);
    }

    @GetMapping("/byCourseId/{courseId}")
    public List<ReviewDTO> getByCourseId(@PathVariable UUID courseId) {
        return reviewService.getReviewByCourseId(courseId);
    }

    @GetMapping
    public Page<ReviewDTO> getAllReviews(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return reviewService.getAllReviews(page, size);
    }

    @DeleteMapping("/{id}")
    public void deleteReview(@PathVariable UUID id) {
        reviewService.deleteReview(id);
    }
}
