package com.example.kafka.coursera.db.entities;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "students")
@EqualsAndHashCode(exclude = { "picture", "createdAt", "updatedAt", "user", "languages" })
public class Student {
    @Id
    private UUID id;

    private String firstName;
    private String lastName;
    private String fathersName;
    private LocalDate dateOfBirth;

    private String phoneNumber;
    private String address;
    private String city;
    private String country;

    private File picture;

    private Instant createdAt;

    private Instant updatedAt;

    @OneToOne
    @JoinColumn
    private User user;

    @OneToMany(mappedBy = "student")
    private List<Language> languages;

    public String getStudentFirstName() {
        return firstName;
    }

    public String getStudentLastName() {
        return lastName;
    }

    public String getStudentFullName() {
        return firstName + " " + lastName;
    }

    public LocalDate getStudentDateOfBirth() {
        return dateOfBirth;
    }

    public String getStudentPhoneNumber() {
        return phoneNumber;
    }

    public String getStudentAddress() {
        return address;
    }

    public String getStudentCity() {
        return city;
    }

    public String getStudentCountry() {
        return country;
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
