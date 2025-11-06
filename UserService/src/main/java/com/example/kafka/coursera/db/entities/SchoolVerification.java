package com.example.kafka.coursera.db.entities;

import com.example.kafka.coursera.db.enums.DocumentType;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity(name = "school_verifications")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SchoolVerification {
    @Id
    private UUID id;

    @OneToOne
    @JoinColumn
    private School school;

    @Enumerated(EnumType.STRING)
    private DocumentType documentType;

    private File document;
    private Instant submittedAt;
    private Instant reviewedAt;
    @OneToOne
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;

    @PrePersist
    protected void onCreate() {
        id = UUID.randomUUID();
    }
}
