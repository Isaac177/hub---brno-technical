package com.example.kafka.coursera.services;

import com.example.kafka.coursera.DTO.StudentDTO;
import com.example.kafka.coursera.FactoryDTOs.StudentFactoryDTO;
import com.example.kafka.coursera.db.entities.File;
import com.example.kafka.coursera.db.entities.Student;
import com.example.kafka.coursera.db.entities.User;
import com.example.kafka.coursera.db.entities.UserPreferences;
import com.example.kafka.coursera.db.enums.LanguageEnum;
import com.example.kafka.coursera.db.repositories.StudentRepository;
import com.example.kafka.coursera.db.repositories.UserRepository;
import com.example.kafka.coursera.events.emitters.StudentEventPublisher;
import com.example.kafka.coursera.events.consumers.StudentDataResponseConsumer;
import com.example.kafka.coursera.exceptions.implementation.ForbiddenException;
import com.example.kafka.coursera.exceptions.implementation.NoChangesException;
import com.example.kafka.coursera.exceptions.implementation.ResourceNotFoundException;
import com.example.kafka.coursera.requests.StudentProfileRequest;
import com.example.kafka.coursera.util.HashChecksum;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StudentFactoryDTO factoryDTO;
    private final StorageService azureService;
    private final TranslationService translationService;
    private final StudentEventPublisher studentEventPublisher;
    private final StudentDataResponseConsumer studentDataResponseConsumer;
    private final CognitoSyncService cognitoSyncService;

    public StudentDTO getStudentById(UUID id) {
        return factoryDTO.makeDTO(studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student with id: " + id + " does not exist")));
    }

    public List<StudentDTO> findAllStudents() {
        // First sync users from Cognito to ensure we have the latest data
        try {
            cognitoSyncService.syncAllCognitoUsers();
        } catch (Exception e) {
            // Log the error but continue with existing data
            System.err.println("Warning: Failed to sync users from Cognito: " + e.getMessage());
        }
        
        // Query users with STUDENT role instead of students table
        List<User> studentUsers = userRepository.findByRole(com.example.kafka.coursera.db.enums.RoleEnum.STUDENT);
        List<StudentDTO> studentDTOs = new ArrayList<>();
        
        for (User user : studentUsers) {
            StudentDTO dto = StudentDTO.builder()
                    .id(user.getId().toString())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .email(user.getEmail())
                    .status(user.getStatus() != null ? user.getStatus().toString() : "ACTIVE")
                    .build();
            
            // If user has an associated Student entity, add that data too
            if (user.getStudent() != null) {
                Student student = user.getStudent();
                dto.setFathersName(student.getFathersName());
                dto.setDateOfBirth(student.getDateOfBirth() != null ? student.getDateOfBirth().toString() : null);
                dto.setPhoneNumber(student.getPhoneNumber());
                dto.setAddress(student.getAddress());
                dto.setCity(student.getCity());
                dto.setCountry(student.getCountry());
                dto.setProfilePictureUrl(student.getPicture() != null ? student.getPicture().getUrl() : null);
            }
            
            studentDTOs.add(dto);
        }
        
        // Extract user IDs for RMQ messaging
        List<UUID> studentIds = studentUsers.stream().map(User::getId).collect(Collectors.toList());
        
        if (!studentIds.isEmpty()) {
            // Emit RMQ message to get related data for all students
            studentEventPublisher.publishStudentDataRequest(studentIds);
            
            // Wait for responses from other services (with timeout)
            try {
                // Wait up to 3 seconds for responses from other services
                // This is a simplified approach - in production, you might want to make this async
                Thread.sleep(3000);
                
                // Enhance each student DTO with aggregated data
                for (StudentDTO studentDTO : studentDTOs) {
                    Map<String, Object> aggregatedData = studentDataResponseConsumer.getAggregatedStudentData(studentDTO.getId());
                    if (aggregatedData != null) {
                        // Add the aggregated data to the DTO
                        studentDTO.setRelatedData(aggregatedData);
                    }
                    // Clean up the aggregated data after use
                    studentDataResponseConsumer.clearStudentData(studentDTO.getId());
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                // Log the interruption but continue with basic student data
                System.err.println("Thread interrupted while waiting for student data responses: " + e.getMessage());
            }
        }
        
        return studentDTOs;
    }

    public StudentDTO updateProfile(StudentProfileRequest request, MultipartFile file) throws Exception {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = user.getStudent();
        Student newStudent = factoryDTO.toEntity(request);

        String email = user.getEmail();
        String jwtEmail = request.getEmail();

        if (!email.equals(jwtEmail))
            throw new ForbiddenException("You're not allowed to change this profile");

        newStudent.setUser(user);
        newStudent.setId(request.getId());
        newStudent.setCreatedAt(student.getCreatedAt());
        newStudent.setUpdatedAt(Instant.now());

        String checksum = (student.getPicture() != null) ? student.getPicture().getCheckSum() : null;
        String reqChecksum = (file != null && !file.isEmpty()) ? HashChecksum.calculateFileChecksum(file) : null;

        File file2upload = new File(null, null, checksum);

        boolean isChecksumEqual = (reqChecksum != null) && file2upload.checkSumEquals(reqChecksum);
        boolean hasChanges = !student.equals(newStudent) || !isChecksumEqual;

        if (!hasChanges)
            throw new NoChangesException();

        if (file != null && !file.isEmpty()) {
            file2upload = azureService.processUpload(student.getPicture(), file, isChecksumEqual);
            newStudent.setPicture(file2upload);
        }

        student = studentRepository.save(newStudent);

        String message = translationService.translate("student.updated", getStudentLanguage(user.getPreferences()));

        return factoryDTO.makeDTO(student, message);
    }

    public void delete(UUID id, String emailRequest) throws Exception {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student with this id: " + id + " not found"));
        User user = student.getUser();

        String email = user.getEmail();
        String jwtEmail = emailRequest;

        boolean isEmailEqual = email.equals(jwtEmail);

        if (!isEmailEqual)
            throw new ForbiddenException("You're not allowed to delete this student");
        else
            studentRepository.deleteById(id);

    }

    public LanguageEnum getStudentLanguage(UserPreferences preferences) {
        return preferences != null ? preferences.getLanguage() : LanguageEnum.EN;
    }
}
