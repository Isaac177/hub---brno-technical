package com.example.kafka.coursera.db.repositories;

import com.example.kafka.coursera.db.entities.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface InstructorRepository extends JpaRepository<Instructor, UUID> {
}
