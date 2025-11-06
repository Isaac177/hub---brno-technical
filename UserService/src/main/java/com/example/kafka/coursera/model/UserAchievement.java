package com.example.kafka.coursera.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "user_achievements")
@Data
public class UserAchievement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String type;

    private String courseId;
    
    private String quizId;

    @Column(nullable = false)
    private Integer score;

    @Column(nullable = false)
    private LocalDateTime completedAt;

    @Column(nullable = false)
    private LocalDateTime earnedAt = LocalDateTime.now();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;
}
