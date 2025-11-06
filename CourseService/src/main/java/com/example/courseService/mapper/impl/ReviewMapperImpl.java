package com.example.courseService.mapper.impl;

import com.example.courseService.mapper.ReviewMapper;
import org.springframework.stereotype.Component;

import com.example.courseService.dto.request.ReviewRequest;
import com.example.courseService.dto.response.ReviewDTO;
import com.example.courseService.model.Review;

@Component
public class ReviewMapperImpl implements ReviewMapper {
    @Override
    public Review toEntity(ReviewRequest request) {
        if (request == null) {
            return null;
        }

        return Review.builder()
                .userId(request.getUserId())
                .rating(request.getRating())
                .comment(request.getComment())
                .isVerifiedPurchase(request.getIsVerifiedPurchase())
                .build();
    }
    @Override
    public ReviewDTO toDto(Review review) {
        if (review == null) {
            return null;
        }

        return ReviewDTO.builder()
                .id(review.getId())
                .courseId(review.getCourse().getId())
                .userId(review.getUserId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .isVerifiedPurchase(review.getIsVerifiedPurchase())
                .helpfulVotes(review.getHelpfulVotes())
                .build();
    }
    @Override
    public void updateEntity(Review review, ReviewRequest request) {
        if (review != null && request != null) {
            review.setUserId(request.getUserId());
            review.setRating(request.getRating());
            review.setComment(request.getComment());
            review.setIsVerifiedPurchase(request.getIsVerifiedPurchase());
        }
    }
}