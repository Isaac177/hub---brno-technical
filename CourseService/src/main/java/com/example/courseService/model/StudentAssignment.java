package com.example.courseService.model;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.DBRef;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = { "file", "submittedTime", "attempts" })

public class StudentAssignment {
    @Id
    private UUID id;

    @DBRef
    private Assignment assignment;

    private UUID studentId;

    private Double points;

    private Instant submittedTime;

    private Integer attempts;

    private String textInput;

    private File file;

    private boolean checked;

    public boolean filesEqual(File otherFile) {
        if (otherFile == null && this.file != null || otherFile != null && this.file == null)
            return false;
        if (this.file != null && !this.file.getCheckSum().equals(otherFile.getCheckSum())) {
            return false;
        }
        return true;
    }
}
