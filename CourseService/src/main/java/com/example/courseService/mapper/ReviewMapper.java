package com.example.courseService.mapper;

import com.example.courseService.dto.request.ReviewRequest;
import com.example.courseService.dto.response.ReviewDTO;
import com.example.courseService.model.Review;

public interface ReviewMapper {
    Review toEntity(ReviewRequest request);

    ReviewDTO toDto(Review review);

    void updateEntity(Review review, ReviewRequest request);
}
