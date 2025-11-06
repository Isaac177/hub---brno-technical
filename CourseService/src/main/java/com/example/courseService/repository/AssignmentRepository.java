package com.example.courseService.repository;

import com.example.courseService.model.Assignment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.UUID;

public interface AssignmentRepository extends MongoRepository<Assignment, UUID> {
}
