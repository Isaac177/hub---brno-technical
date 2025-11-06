package com.example.kafka.coursera.requests;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingRequest {
    private UUID instructorId;
    private String comment;
    private int score;
}
