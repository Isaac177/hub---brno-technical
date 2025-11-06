package com.example.kafka.coursera.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@JsonIgnoreProperties
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SchoolDTO {
    private String message;
    private String id;
    private String name;

    private String description;
    private String website;
    private int foundedYear;
    private String logoUrl;
    private String status;

    private String primaryContactUserEmail;

    private String address;
    private String city;
    private String country;
    private String phoneNumber;

    private String email;

    private String approvedBy;
    
    // Aggregated data from other services
    private Map<String, Object> courseData;
    private Map<String, Object> studentData;
    private Map<String, Object> aggregatedData;
}
