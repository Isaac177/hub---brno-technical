package com.example.courseService.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorDTO implements Serializable {
    private UUID id;
    private String firstName;
    private String lastName;
    private String fathersName;
    private String avatarUrl;
    private String bio;
    private int courseCounts;
    private double rating;
}