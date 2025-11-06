package com.example.kafka.coursera.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@JsonIgnoreProperties
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentDTO {
    private String message;
    @JsonProperty("id")
    private String id;
    private String firstName;
    private String lastName;
    private String fathersName;
    private String dateOfBirth;

    private String phoneNumber;
    private String address;
    private String city;
    private String country;

    private String profilePictureUrl;
    
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("relatedData")
    private Map<String, Object> relatedData;
    
    // Helper method to get UUID from string ID
    public UUID getId() {
        return id != null ? UUID.fromString(id) : null;
    }
}
