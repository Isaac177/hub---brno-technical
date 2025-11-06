package com.example.kafka.coursera.db.repositories;

import com.example.kafka.coursera.db.entities.School;
import com.example.kafka.coursera.db.enums.SchoolStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SchoolRepository extends JpaRepository<School, UUID> {
    List<School> findAllByStatus(SchoolStatusEnum status);
    
    @Modifying
    @Query(value = "DELETE FROM school_verifications WHERE school_id = :schoolId", nativeQuery = true)
    void deleteSchoolVerificationsBySchoolId(@Param("schoolId") UUID schoolId);
}
