package com.example.kafka.coursera.FactoryDTOs;

import com.example.kafka.coursera.DTO.SchoolVerificationDTO;
import com.example.kafka.coursera.db.entities.SchoolVerification;
import org.springframework.stereotype.Component;

@Component
public class SchoolVerificationFactoryDTO {
    public SchoolVerificationDTO makeDTO(SchoolVerification schoolVerification) {
        return SchoolVerificationDTO.builder()
                .id(String.valueOf(schoolVerification.getId()))
                .schoolId(String.valueOf(schoolVerification.getSchool().getId()))
                .documentType(String.valueOf(schoolVerification.getDocumentType()))
                .documentUrl(schoolVerification.getDocument().getUrl())
                .reviewedById(String.valueOf(schoolVerification.getReviewedBy().getId()))
                .build();
    }
}
