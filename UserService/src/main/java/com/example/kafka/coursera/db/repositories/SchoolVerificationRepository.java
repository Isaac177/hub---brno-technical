package com.example.kafka.coursera.db.repositories;

import com.example.kafka.coursera.db.entities.School;
import com.example.kafka.coursera.db.entities.SchoolVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SchoolVerificationRepository extends JpaRepository<SchoolVerification, UUID> {
    SchoolVerification findBySchool(School school);
}
