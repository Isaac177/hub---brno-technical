package com.example.kafka.coursera.services;

import com.example.kafka.coursera.db.entities.School;
import com.example.kafka.coursera.db.entities.SchoolVerification;
import com.example.kafka.coursera.db.enums.SchoolStatusEnum;
import com.example.kafka.coursera.db.repositories.SchoolRepository;
import com.example.kafka.coursera.db.repositories.SchoolVerificationRepository;
import com.example.kafka.coursera.db.repositories.UserRepository;
import com.example.kafka.coursera.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final SchoolVerificationRepository verificationRepository;
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;

    public void approveSchool(UUID schoolId) {
        try {
            School school = schoolRepository.findById(schoolId)
                    .orElseThrow(() -> new ResourceNotFoundException("School " + schoolId + " doesn't exist"));
            SchoolVerification verification = school.getVerification();
            school.setStatus(SchoolStatusEnum.APPROVED);
            verification.setReviewedBy(null); // Will be set by authentication system
            verification.setReviewedAt(Instant.now());
            schoolRepository.save(school);
            verificationRepository.save(verification);
        } catch (Exception e) {
            throw new ResourceNotFoundException("School " + schoolId + " doesn't exist");
        }
    }

    public void rejectSchool(UUID schoolId) {
        try {
            School school = schoolRepository.findById(schoolId)
                    .orElseThrow(() -> new ResourceNotFoundException("School " + schoolId + " doesn't exist"));
            SchoolVerification verification = school.getVerification();
            school.setStatus(SchoolStatusEnum.REJECTED);
            verification.setReviewedBy(null); // Will be set by authentication system
            verification.setReviewedAt(Instant.now());
            schoolRepository.save(school);
            verificationRepository.save(verification);
        } catch (Exception e) {
            throw new ResourceNotFoundException("School " + schoolId + " doesn't exist");
        }
    }
}
