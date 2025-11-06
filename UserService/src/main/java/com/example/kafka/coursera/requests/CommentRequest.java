package com.example.kafka.coursera.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIgnoreProperties
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class CommentRequest {
    @NotNull
    private UUID postId;
    @NotNull
    private String content;
    @NotBlank
    private String email;
}
