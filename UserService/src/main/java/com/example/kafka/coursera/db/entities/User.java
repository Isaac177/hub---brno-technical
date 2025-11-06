package com.example.kafka.coursera.db.entities;

import com.example.kafka.coursera.db.enums.RoleEnum;
import com.example.kafka.coursera.db.enums.StatusEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user_coursera")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "middle_name")
    private String middleName;

    @Column(name = "name")
    private String name;

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified;

    @Enumerated(EnumType.STRING)
    private StatusEnum status;

    @Enumerated(EnumType.STRING)
    private RoleEnum role;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @OneToOne(mappedBy = "user")
    private Student student;

    @OneToOne(mappedBy = "primaryContactUser")
    private School school;

    @OneToOne(mappedBy = "user")
    private UserPreferences preferences;

    @OneToMany(mappedBy = "author")
    private List<Like> likes;
}
