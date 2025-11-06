package com.example.kafka.coursera.DTO;

import com.example.kafka.coursera.db.enums.DocumentType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SchoolVerificationDTO {
    private String id;
    private String schoolId;
    private String documentType;
    private String documentUrl;
    private String reviewedById;
}
