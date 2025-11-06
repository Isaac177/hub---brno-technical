package com.example.kafka.coursera.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIgnoreProperties
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class UserLoginRequest {
    @NotNull(message = "Email is mandatory")
    @Email(message = "Email isnt correct")
    private String email;
    @NotNull(message = "Password is mandatory")
    private String password;
}
