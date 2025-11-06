package com.example.kafka.coursera.requests;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIgnoreProperties
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class StudentProfileRequest {
    @NotNull
    private UUID id;

    @NotBlank
    private String email;

    @NotBlank(message = "First name cannot be empty")
    private String firstName;

    @NotBlank(message = "Last name cannot be empty")
    private String lastName;
    private String fathersName;
    @NotNull(message = "Date of birth cannot be null")
    private String dateOfBirth;

    private String phoneNumber;

    private String address;

    private String city;

    private String country;
}