package com.example.kafka.coursera.db.repositories;

import com.example.kafka.coursera.db.entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
}
