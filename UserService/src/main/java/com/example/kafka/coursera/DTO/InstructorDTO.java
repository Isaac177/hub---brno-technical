package com.example.kafka.coursera.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;

import java.io.Serializable;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InstructorDTO implements Serializable {
    private UUID id;
    private String firstName;
    private String lastName;
    private String fathersName;
    private String avatarUrl;
    private String bio;

    private Long courseCounts;
    private List<RatingDTO> ratings;

}
