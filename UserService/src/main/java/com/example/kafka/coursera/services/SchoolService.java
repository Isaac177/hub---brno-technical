package com.example.kafka.coursera.services;

import com.example.kafka.coursera.DTO.SchoolDTO;
import com.example.kafka.coursera.FactoryDTOs.SchoolFactoryDTO;
import com.example.kafka.coursera.db.entities.File;
import com.example.kafka.coursera.db.entities.School;
import com.example.kafka.coursera.db.entities.User;
import com.example.kafka.coursera.db.enums.SchoolStatusEnum;
import com.example.kafka.coursera.db.repositories.SchoolRepository;
import com.example.kafka.coursera.db.repositories.UserRepository;
import com.example.kafka.coursera.events.emitters.SchoolEventPublisher;
import com.example.kafka.coursera.events.consumers.SchoolDataResponseConsumer;
import com.example.kafka.coursera.exceptions.implementation.NoChangesException;
import com.example.kafka.coursera.exceptions.implementation.ResourceNotFoundException;
import com.example.kafka.coursera.requests.SchoolRequest;
import com.example.kafka.coursera.util.HashChecksum;

import jakarta.transaction.Transactional;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchoolService {
    private final SchoolRepository repository;
    private final SchoolFactoryDTO factoryDTO;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final SchoolEventPublisher schoolEventPublisher;
    private final DeletionTrackingService deletionTrackingService;
    private final SchoolDataResponseConsumer schoolDataResponseConsumer;

    private static final Logger log = LoggerFactory.getLogger(SchoolService.class);

    public List<SchoolDTO> getAllSchools() {
        return repository.findAll().stream().map(factoryDTO::makeDTO).toList();
    }

    public SchoolDTO getSchoolById(UUID id) {
        School school = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("School " + id + " doesn't exist"));

        schoolDataResponseConsumer.clearAggregatedData(id);

        schoolEventPublisher.publishSchoolDataRequest(id);

        schoolDataResponseConsumer.waitForResponses(id, 5, 2);
        var aggregatedData = schoolDataResponseConsumer.getAggregatedData(id);

        SchoolDTO schoolDTO = factoryDTO.makeDTO(school);

        if (aggregatedData != null && !aggregatedData.isEmpty()) {
            schoolDTO.setAggregatedData(aggregatedData);
            var courseServiceData = aggregatedData.get("COURSE_SERVICE");
            var studentServiceData = aggregatedData.get("STUDENT_MANAGEMENT_SERVICE");

            if (courseServiceData != null) {
                schoolDTO.setCourseData((Map<String, Object>) courseServiceData);
            }

            if (studentServiceData != null) {
                schoolDTO.setStudentData((Map<String, Object>) studentServiceData);
                enrichWithUserData(schoolDTO, (Map<String, Object>) studentServiceData);
            }

            aggregatedData.forEach((service, data) -> {
            });
        } else {
            log.warn("⚠️ No aggregated data received for school {}", id);
        }

        schoolDataResponseConsumer.clearAggregatedData(id);

        return schoolDTO;
    }

    public List<SchoolDTO> getAllPendingSchool() {
        return repository.findAllByStatus(SchoolStatusEnum.PENDING).stream().map(factoryDTO::makeDTO).toList();
    }

    @Transactional
    public SchoolDTO createSchool(SchoolRequest request, MultipartFile logoRequest) throws Exception {
        File logo = null;

        if (logoRequest != null && !logoRequest.isEmpty()) {
            logo = storageService.uploadFile(logoRequest);
        }

        School school = factoryDTO.makeSchool(request, logo);
        school.setStatus(SchoolStatusEnum.PENDING);

        if (request.getPrimaryContactEmail() != null && !request.getPrimaryContactEmail().isEmpty()) {
            User primaryContactUser = userRepository.findByEmail(request.getPrimaryContactEmail())
                    .orElse(null);
            school.setPrimaryContactUser(primaryContactUser);
        }

        School savedSchool = repository.save(school);

        return factoryDTO.makeDTO(savedSchool, "Successfully created school");
    }

    @Transactional
    public SchoolDTO updateSchool(SchoolRequest request, MultipartFile logoRequest, UUID schoolId) throws Exception {
        School existingSchool = findExistingSchool(schoolId);

        User newUser = null;
        if (request.getPrimaryContactEmail() != null && !request.getPrimaryContactEmail().isEmpty()) {
            newUser = userRepository.findByEmail(request.getPrimaryContactEmail())
                    .orElse(null);
        }

        File newLogo = null;
        String newChecksum = null;
        boolean logoChanged = false;

        if (logoRequest != null && !logoRequest.isEmpty()) {
            logoChanged = true;
            newChecksum = HashChecksum.calculateFileChecksum(logoRequest);
            newLogo = new File(null, null, newChecksum);
        }

        School updatedSchool = factoryDTO.makeSchool(request, newLogo);
        updatedSchool.setPrimaryContactUser(newUser);
        updatedSchool.setId(schoolId);
        updatedSchool.setCreatedAt(existingSchool.getCreatedAt());
        updatedSchool.setUpdatedAt(Instant.now());

        if (request.getStatus() != null) {
            updatedSchool.setStatus(request.getStatus());
        } else {
            updatedSchool.setStatus(existingSchool.getStatus());
        }

        boolean isChecksumEqual = (existingSchool.getLogo() == null && newChecksum == null) ||
                (existingSchool.getLogo() != null && newChecksum != null
                        && existingSchool.getLogo().checkSumEquals(newChecksum));

        boolean hasChanges = hasChanges(existingSchool, updatedSchool,
                existingSchool.getPrimaryContactUser(), newUser, isChecksumEqual) || logoChanged;

        if (!hasChanges) {
            log.warn("No changes detected for school {} - throwing NoChangesException", schoolId);
            throw new NoChangesException();
        }

        if (logoRequest != null && !logoRequest.isEmpty()) {
            File processedLogo = storageService.processUpload(existingSchool.getLogo(), logoRequest, isChecksumEqual);
            updatedSchool.setLogo(processedLogo);
        } else if (existingSchool.getLogo() != null && newLogo == null) {
            updatedSchool.setLogo(null);
            storageService.deleteFile(existingSchool.getLogo().getFilename());
        } else {
            updatedSchool.setLogo(existingSchool.getLogo());
        }

        School savedSchool = repository.save(updatedSchool);

        return factoryDTO.makeDTO(savedSchool);
    }

    @Transactional
    public void deleteSchool(UUID id) {

        deletionTrackingService.addPendingDeletion(id);

        schoolEventPublisher.publishSchoolDeletion(id);

        boolean canDelete = deletionTrackingService.waitForValidationResult(id, 30000);

        if (!canDelete) {
            String reason = deletionTrackingService.getDeletionRejectionReason(id);
            deletionTrackingService.removePendingDeletion(id);
            throw new RuntimeException("Cannot delete school: " + reason);
        }

        performActualDeletion(id);
        deletionTrackingService.removePendingDeletion(id);
    }

    @Transactional
    public void performActualDeletion(UUID id) {
        School school = findExistingSchool(id);

        try {
            if (school.getLogo() != null && school.getLogo().getFilename() != null) {
                storageService.deleteFile(school.getLogo().getFilename());
            }

            if (school.getVerification() != null) {
                if (school.getVerification().getDocument() != null &&
                        school.getVerification().getDocument().getFilename() != null) {
                    storageService.deleteFile(school.getVerification().getDocument().getFilename());
                }
                repository.deleteSchoolVerificationsBySchoolId(id);
            }

            repository.deleteById(id);

            log.info("Successfully deleted school with ID: {}", id);
        } catch (Exception e) {
            log.error("Error performing actual deletion of school with ID: {}", id, e);
            throw new RuntimeException("Failed to delete school: " + e.getMessage(), e);
        }
    }

    public String updateLogo(MultipartFile picture) throws Exception {
        return "Successfully update";
    }

    private School findExistingSchool(UUID schoolId) {
        return repository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("School doesn't exist"));
    }

    private boolean hasChanges(School existingSchool, School newSchool, User existingUser, User newUser,
            boolean isChecksumEqual) {

        boolean nameChanged = !safeEquals(existingSchool.getName(), newSchool.getName());
        boolean descriptionChanged = !safeEquals(existingSchool.getDescription(), newSchool.getDescription());
        boolean websiteChanged = !safeEquals(existingSchool.getWebsite(), newSchool.getWebsite());
        boolean foundedYearChanged = existingSchool.getFoundedYear() != newSchool.getFoundedYear();
        boolean emailChanged = !safeEquals(existingSchool.getEmail(), newSchool.getEmail());
        boolean addressChanged = !safeEquals(existingSchool.getAddress(), newSchool.getAddress());
        boolean cityChanged = !safeEquals(existingSchool.getCity(), newSchool.getCity());
        boolean countryChanged = !safeEquals(existingSchool.getCountry(), newSchool.getCountry());
        boolean phoneChanged = !safeEquals(existingSchool.getPhoneNumber(), newSchool.getPhoneNumber());

        boolean basicFieldsChanged = nameChanged || descriptionChanged || websiteChanged ||
                foundedYearChanged || emailChanged || addressChanged ||
                cityChanged || countryChanged || phoneChanged;

        boolean logoChanged = !isChecksumEqual;

        boolean userChanged = (existingUser == null && newUser != null) ||
                (existingUser != null && newUser == null) ||
                (existingUser != null && newUser != null && !existingUser.getId().equals(newUser.getId()));

        boolean statusChanged = existingSchool.getStatus() != newSchool.getStatus();

        return basicFieldsChanged || logoChanged || userChanged || statusChanged;
    }

    private boolean safeEquals(String str1, String str2) {
        if (str1 == null && str2 == null)
            return true;
        if (str1 == null || str2 == null)
            return false;
        return str1.equals(str2);
    }

    @SuppressWarnings("unchecked")
    private void enrichWithUserData(SchoolDTO schoolDTO, Map<String, Object> studentServiceData) {
        try {
            log.info("🔍 Enriching school data with user details");

            // Extract enrollments from student service data
            List<Map<String, Object>> enrollments = (List<Map<String, Object>>) studentServiceData.get("enrollments");
            if (enrollments == null || enrollments.isEmpty()) {
                log.info("No enrollments found to enrich with user data");
                return;
            }

            // Extract unique user IDs and emails
            Set<String> userEmails = new HashSet<>();
            Set<String> userIds = new HashSet<>();

            for (Map<String, Object> enrollment : enrollments) {
                String userEmail = (String) enrollment.get("userEmail");
                String userId = (String) enrollment.get("userId");

                if (userEmail != null && !userEmail.isEmpty()) {
                    userEmails.add(userEmail);
                }
                if (userId != null && !userId.isEmpty()) {
                    userIds.add(userId);
                }
            }

            log.info("📧 Found {} unique user emails and {} user IDs", userEmails.size(), userIds.size());

            // Fetch users by email and ID
            List<User> usersByEmail = userEmails.isEmpty() ? new ArrayList<>() :
                userRepository.findAllByEmailIn(new ArrayList<>(userEmails));
            List<User> usersById = userIds.isEmpty() ? new ArrayList<>() :
                userRepository.findAllById(userIds.stream().map(UUID::fromString).collect(Collectors.toList()));

            // Combine all users and remove duplicates
            Map<String, User> userMap = new HashMap<>();

            // Add users found by email
            for (User user : usersByEmail) {
                userMap.put(user.getEmail(), user);
                userMap.put(user.getId().toString(), user);
            }

            for (User user : usersById) {
                userMap.put(user.getEmail(), user);
                userMap.put(user.getId().toString(), user);
            }

            log.info("👥 Found {} unique users to include", userMap.size());

            List<Map<String, Object>> usersData = userMap.values().stream()
                .distinct()
                .map(user -> {
                    Map<String, Object> userData = new HashMap<>();
                    userData.put("id", user.getId().toString());
                    userData.put("email", user.getEmail());
                    userData.put("firstName", user.getFirstName());
                    userData.put("lastName", user.getLastName());
                    userData.put("middleName", user.getMiddleName());
                    userData.put("name", user.getName());
                    userData.put("createdAt", user.getCreatedAt());
                    userData.put("status", user.getStatus());
                    userData.put("role", user.getRole());
                    return userData;
                })
                .collect(Collectors.toList());

            Map<String, Object> enrichedStudentData = new HashMap<>(studentServiceData);
            enrichedStudentData.put("users", usersData);

            schoolDTO.setStudentData(enrichedStudentData);

            Map<String, Object> aggregatedData = schoolDTO.getAggregatedData();
            if (aggregatedData != null) {
                Map<String, Object> enrichedAggregatedStudentData = new HashMap<>((Map<String, Object>) aggregatedData.get("STUDENT_MANAGEMENT_SERVICE"));
                enrichedAggregatedStudentData.put("users", usersData);
                aggregatedData.put("STUDENT_MANAGEMENT_SERVICE", enrichedAggregatedStudentData);
                schoolDTO.setAggregatedData(aggregatedData);
            }

            log.info("✅ Successfully enriched school data with {} user details", usersData.size());

        } catch (Exception e) {
            log.error("❌ Error enriching school data with user details: {}", e.getMessage(), e);
        }
    }
}
