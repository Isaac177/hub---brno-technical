package com.example.kafka.coursera.DTO;

import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingDTO implements Serializable {
    private UUID id;
    private int score;
    private String comment;
}
