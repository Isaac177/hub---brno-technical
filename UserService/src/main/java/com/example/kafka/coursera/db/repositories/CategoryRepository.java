package com.example.kafka.coursera.db.repositories;

import com.example.kafka.coursera.db.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
}
