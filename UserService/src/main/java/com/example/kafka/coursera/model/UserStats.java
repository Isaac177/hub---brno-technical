package com.example.kafka.coursera.model;

import lombok.Data;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_stats")
@Data
public class UserStats {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String userId;

    @Column(nullable = false)
    private int totalQuizzesTaken = 0;

    private Double avgQuizScore;

    @Column(nullable = false)
    private int perfectScores = 0;

    @Column(nullable = false)
    private LocalDateTime lastActivityAt = LocalDateTime.now();
}
