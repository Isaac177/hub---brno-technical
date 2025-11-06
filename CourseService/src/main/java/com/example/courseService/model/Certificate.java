package com.example.courseService.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "certificates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = { "certificate", "id", "issueDate" })
public class Certificate {
    @Id
    private UUID id;

    @DBRef
    private Course course;

    private UUID userId;
    private LocalDateTime issueDate;

    @NotNull
    private File certificate;
    private String verificationCode;

}
