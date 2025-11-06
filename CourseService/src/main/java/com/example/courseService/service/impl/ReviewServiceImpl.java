package com.example.courseService.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

import com.example.courseService.service.ReviewService;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.example.courseService.dto.request.ReviewRequest;
import com.example.courseService.dto.response.ReviewDTO;
import com.example.courseService.model.Course;
import com.example.courseService.model.Review;
import com.example.courseService.repository.CourseRepository;
import com.example.courseService.repository.ReviewRepository;
import com.example.courseService.exception.implementation.NoChangesException;
import com.example.courseService.exception.implementation.ResourceNotFoundException;
import com.example.courseService.mapper.ReviewMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final CourseRepository courseRepository;
    private final MessageSource messageSource;

    @Override
    public ReviewDTO createReview(ReviewRequest request) {
        Review review = reviewMapper.toEntity(request);
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("The given Id must not be null"));
        review.setCourse(course);
        review.setId(UUID.randomUUID());
        review.setCreatedAt(LocalDateTime.now());
        reviewRepository.save(review);

        return reviewMapper.toDto(review);
    }

    @Override
    public ReviewDTO updateReview(UUID reviewId, ReviewRequest request) {
        Review existingReview = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        Locale locale = LocaleContextHolder.getLocale();

        Review newReview = reviewMapper.toEntity(request);

        boolean hasChanges = !existingReview.equals(newReview);

        if (!hasChanges) {
            throw new NoChangesException(messageSource, locale);
        }

        existingReview.setComment(newReview.getComment());
        existingReview.setRating(newReview.getRating());
        reviewRepository.save(existingReview);

        return reviewMapper.toDto(existingReview);
    }

    @Override
    public ReviewDTO getReviewById(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        return reviewMapper.toDto(review);
    }

    @Override
    public List<ReviewDTO> getReviewByCourseId(UUID courseId) {
        List<Review> reviews = reviewRepository.findByCourseId(courseId);
        return reviews.stream().map(r -> reviewMapper.toDto(r)).collect(Collectors.toList());
    }

    @Override
    public Page<ReviewDTO> getAllReviews(int page, int size) {
        Page<Review> reviews = reviewRepository.findAll(PageRequest.of(page, size));
        return reviews.map(r -> reviewMapper.toDto(r));
    }

    @Override
    public void deleteReview(UUID reviewId) {
        reviewRepository.deleteById(reviewId);
    }
}
