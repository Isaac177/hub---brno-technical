package com.example.kafka.coursera.db.repositories;

import com.example.kafka.coursera.db.entities.Post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {
    Page<Post> findAll(Pageable pageable); // Method to retrieve paginated results

    @Query("""
    SELECT p FROM posts p
    LEFT JOIN FETCH p.comments
    LEFT JOIN FETCH p.category
    LEFT JOIN FETCH p.author
    WHERE p.id = :id
""")
    Optional<Post> findByIdWithComments(@Param("id") UUID id);
}
