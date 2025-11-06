package com.example.kafka.coursera.db.repositories;

import com.example.kafka.coursera.db.entities.User;
import com.example.kafka.coursera.db.entities.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPreferencesRepository extends JpaRepository<UserPreferences, UUID> {
    Optional<UserPreferences> findByUser(User user);
}
