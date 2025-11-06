package com.example.kafka.coursera.db.repositories;

import com.example.kafka.coursera.db.entities.Like;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LikeRepository extends JpaRepository<Like, UUID> {
}
