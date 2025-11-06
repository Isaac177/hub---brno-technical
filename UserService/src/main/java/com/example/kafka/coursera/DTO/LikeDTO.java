package com.example.kafka.coursera.DTO;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIgnoreProperties
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class LikeDTO implements Serializable {
    private String message;
    private String id;
    private String postId;
    private String userEmail;
}
