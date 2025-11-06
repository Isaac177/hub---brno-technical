package com.example.courseService.repository;

import com.example.courseService.model.StudentAssignment;

import java.util.List;
import java.util.UUID;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StudentAssignmentRepository extends MongoRepository<StudentAssignment, UUID> {
    List<StudentAssignment> findByAssignmentId(UUID id);

    StudentAssignment findAssignmentByStudentIdAndAssignmentId(UUID studentId, UUID assignmentId);
}
