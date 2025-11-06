package com.example.kafka.coursera.db.repositories;


import com.example.kafka.coursera.db.entities.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface RatingRepository extends JpaRepository<Rating, UUID> {
}