package com.example.kafka.coursera.db.entities;

import com.example.kafka.coursera.db.enums.LanguageEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferences {
    @Id
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "language")
    private LanguageEnum language;

    @Column(name = "email_notifications", nullable = false)
    private Boolean emailNotifications;

    @Column(name = "marketing_communications", nullable = false)
    private Boolean marketingCommunications;

    @Column(name = "push_notifications", nullable = false)
    private Boolean pushNotifications;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
