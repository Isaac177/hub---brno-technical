package com.example.courseService.service;

import com.example.courseService.dto.request.ReviewRequest;
import com.example.courseService.dto.response.ReviewDTO;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface ReviewService {
    ReviewDTO createReview(ReviewRequest request);

    ReviewDTO updateReview(UUID reviewId, ReviewRequest request);

    ReviewDTO getReviewById(UUID reviewId);

    List<ReviewDTO> getReviewByCourseId(UUID courseId);

    Page<ReviewDTO> getAllReviews(int page, int size);

    void deleteReview(UUID reviewId);
}
