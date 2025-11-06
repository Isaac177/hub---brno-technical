package com.example.kafka.coursera.db.repositories;

import com.example.kafka.coursera.db.entities.Translation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TranslationRepository extends JpaRepository<Translation, Long> {
    Optional<Translation> findByName(String name);
}
