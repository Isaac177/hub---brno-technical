package com.example.kafka.coursera.DTO;

import com.example.kafka.coursera.db.enums.RoleEnum;
import com.example.kafka.coursera.db.enums.SchoolStatusEnum;
import com.example.kafka.coursera.db.enums.StatusEnum;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Data
@JsonIgnoreProperties
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private String id;
    private String email;
    private String password;

    private String role;
    private StatusEnum status;

    private String studentId;
    private String schoolId;

    //StudentDTO
    private String firstName;
    private String lastName;
    private String dateOfBirth;

    private String phoneNumber;
    private String address;
    private String city;
    private String country;

    private String profilePictureUrl;

    //SchoolDTO
    private String name;

    private String description;
    private String website;
    private int foundedYear;
    private String logoUrl;
    private String schoolStatus;

    private String primaryContactUserId;

    private String emailSchool;

    private UUID approvedBy;
    
    // Aggregated data from other services
    private Map<String, Object> aggregatedData;
    private Map<String, Object> courseData;
    private Map<String, Object> enrollmentData;
}
