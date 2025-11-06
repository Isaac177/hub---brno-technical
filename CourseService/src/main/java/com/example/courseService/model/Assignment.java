package com.example.courseService.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.example.courseService.enums.AssignmentFormat;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.util.UUID;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "assignments")
@EqualsAndHashCode(exclude = "id")
public class Assignment {
    @Id
    private UUID id;

    @DBRef
    private Module module;

    private String title;

    private String description;

    private Instant dueDate;

    private Integer maxScore;

    @Enumerated(EnumType.STRING)
    private AssignmentFormat assignmentFormat;

    private Integer attempts;

}
