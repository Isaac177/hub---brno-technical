package com.example.courseService.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.courseService.model.Category;

import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends MongoRepository<Category, UUID> {
    Optional<Category> findByName(String name);

}
