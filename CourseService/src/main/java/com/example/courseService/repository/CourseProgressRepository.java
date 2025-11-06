package com.example.courseService.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.courseService.model.CourseProgress;

import java.util.UUID;

public interface CourseProgressRepository extends MongoRepository<CourseProgress, UUID> {
}
