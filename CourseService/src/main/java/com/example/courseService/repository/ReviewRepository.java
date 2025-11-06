package com.example.courseService.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.courseService.model.Review;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends MongoRepository<Review, UUID> {
    List<Review> findByCourseId(UUID courseId);

    Page<Review> findAll(Pageable pageable); // Method to retrieve paginated results

}
