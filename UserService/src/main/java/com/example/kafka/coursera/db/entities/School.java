package com.example.kafka.coursera.db.entities;

import com.example.kafka.coursera.db.enums.SchoolStatusEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "school")
@EqualsAndHashCode(exclude = { "createdAt", "updatedAt", "verification", "primaryContactUser", "logo" })
public class School {
    @Id
    private UUID id = UUID.randomUUID();

    private String email;
    private String name;
    @Column(length = 2550)
    private String description;
    private String website;
    private int foundedYear;
    private File logo;

    @Enumerated(EnumType.STRING)
    private SchoolStatusEnum status;

    @ManyToOne
    @JoinColumn
    private User primaryContactUser;

    @OneToOne(mappedBy = "school")
    private SchoolVerification verification;

    private String address;
    private String city;
    private String country;
    private String phoneNumber;

    private Instant createdAt;
    private Instant updatedAt;

    public String getSchoolName() {
        return name;
    }

    public String getSchoolDescription() {
        return description;
    }

    public String getSchoolAddress() {
        return address;
    }

    public String getSchoolCity() {
        return city;
    }

    public String getSchoolCountry() {
        return country;
    }

    public String getSchoolPhoneNumber() {
        return phoneNumber;
    }

    public String getSchoolWebsite() {
        return website;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        id = UUID.randomUUID();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
