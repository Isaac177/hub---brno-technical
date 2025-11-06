package com.example.kafka.coursera.requests;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIgnoreProperties
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class PostRequest {
    @NotBlank
    private String email;
    @NotNull(message = "Title is a mandatory")
    private String title;
    @NotNull(message = "Content is a mandatory")
    private String content;
    @NotNull(message = "Type is a mandatory")
    private String type;
}
