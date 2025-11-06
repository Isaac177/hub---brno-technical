package com.example.kafka.coursera.db.repositories;

import com.example.kafka.coursera.db.entities.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {
}
