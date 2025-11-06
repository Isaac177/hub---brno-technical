package com.example.kafka.coursera.services.impl;

import com.example.kafka.coursera.DTO.UserDTO;
import com.example.kafka.coursera.FactoryDTOs.UserFactoryDTO;
import com.example.kafka.coursera.db.entities.User;
import com.example.kafka.coursera.db.enums.RoleEnum;
import com.example.kafka.coursera.db.enums.StatusEnum;
import com.example.kafka.coursera.db.repositories.UserRepository;
import com.example.kafka.coursera.services.UserService;
import com.example.kafka.coursera.events.emitters.UserEventPublisher;
import com.example.kafka.coursera.events.consumers.UserDataResponseConsumer;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);
    private final UserRepository userRepository;
    private final UserFactoryDTO userFactoryDTO;
    private final UserEventPublisher userEventPublisher;
    private final UserDataResponseConsumer userDataResponseConsumer;

    @Override
    public UserDTO findById(UUID id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (!userOptional.isPresent()) {
            log.warn("User with id {} not found", id);
            return null;
        }
        
        User user = userOptional.get();
        
        // Clear any previous aggregated data for this user
        userDataResponseConsumer.clearAggregatedData(id);
        
        // Publish user data request event to gather course and enrollment data
        userEventPublisher.publishUserDataRequest(id);
        
        // Wait for responses from external services (course and student management services)
        userDataResponseConsumer.waitForResponses(id, 5, 2);
        var aggregatedData = userDataResponseConsumer.getAggregatedData(id);
        
        // Create basic user DTO
        UserDTO userDTO = userFactoryDTO.makeDTO(user);
        
        // Enrich with aggregated data from external services
        if (aggregatedData != null && !aggregatedData.isEmpty()) {
            userDTO.setAggregatedData(aggregatedData);
            
            var courseServiceData = aggregatedData.get("COURSE_SERVICE");
            var studentServiceData = aggregatedData.get("STUDENT_MANAGEMENT_SERVICE");
            
            if (courseServiceData != null) {
                userDTO.setCourseData((Map<String, Object>) courseServiceData);
                log.info("✅ Enriched user {} with course data", id);
            }
            
            if (studentServiceData != null) {
                userDTO.setEnrollmentData((Map<String, Object>) studentServiceData);
                log.info("✅ Enriched user {} with enrollment data", id);
            }
            
        } else {
            log.warn("⚠️ No aggregated data received for user {}", id);
        }
        
        // Clear aggregated data to free memory
        userDataResponseConsumer.clearAggregatedData(id);
        
        return userDTO;
    }

    @Override
    public UserDTO findByEmail(String email) {
        log.info("[findByEmail] Looking up user in database with email: {}", email);
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (!userOptional.isPresent()) {
            log.warn("[findByEmail] No user found for email: {}", email);
            return null;
        }

        User user = userOptional.get();
        log.info("[findByEmail] Found user: id={}, email={}, firstName={}, lastName={}, role={}", 
            user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), user.getRole());

        if (user.getRole() == null) {
            log.info("[findByEmail] Setting default role STUDENT for user: {}", email);
            user.setRole(RoleEnum.STUDENT);
            user = userRepository.save(user);
            log.info("[findByEmail] Updated user with default role: {}", user.getRole());
        }

        UserDTO dto = userFactoryDTO.makeDTO(user);
        log.info("[findByEmail] Created DTO for user: id={}, email={}, firstName={}, lastName={}, name={}, role={}", 
            dto.getId(), dto.getEmail(), dto.getFirstName(), dto.getLastName(), dto.getName(), dto.getRole());
        
        return dto;
    }

    @Override
    public List<UserDTO> findAll(int page, int size) {
        log.info("[findAll] Fetching users page={}, size={}", page, size);
        Page<User> users = userRepository.findAll(PageRequest.of(page, size));
        List<UserDTO> dtos = users.stream().map(userFactoryDTO::makeDTO).toList();
        log.info("[findAll] Found {} users", dtos.size());
        return dtos;
    }

    @Override
    public void deleteById(UUID id) {
        log.info("[deleteById] Deleting user with id: {}", id);
        userRepository.deleteById(id);
    }

    @Override
    public List<UserDTO> findByIds(List<UUID> ids) {
        log.info("[findByIds] Looking up users with ids: {}", ids);
        List<User> users = userRepository.findAllById(ids);
        List<UserDTO> dtos = users.stream()
            .map(userFactoryDTO::makeDTO)
            .toList();
        log.info("[findByIds] Found {} users out of {} requested", dtos.size(), ids.size());
        return dtos;
    }

    @Override
    public List<UserDTO> findByEmails(List<String> emails) {
        log.info("[findByEmails] Looking up users with emails: {}", emails);
        List<User> users = userRepository.findAllByEmailIn(emails);
        List<UserDTO> dtos = users.stream()
            .map(userFactoryDTO::makeDTO)
            .toList();
        log.info("[findByEmails] Found {} users out of {} requested", dtos.size(), emails.size());
        return dtos;
    }

    @Override
    @Transactional
    public UserDTO updateUserStatus(UUID id, StatusEnum status) {
        log.info("[updateUserStatus] Updating status for user {} to {}", id, status);
        
        Optional<User> userOptional = userRepository.findById(id);
        if (!userOptional.isPresent()) {
            log.warn("[updateUserStatus] User with id {} not found", id);
            return null;
        }
        
        User user = userOptional.get();
        user.setStatus(status);
        user.setUpdatedAt(Instant.now());
        
        User savedUser = userRepository.save(user);
        log.info("[updateUserStatus] Successfully updated user {} status to {}", id, status);
        
        return userFactoryDTO.makeDTO(savedUser);
    }

    @Override
    @Transactional
    public boolean deleteUser(UUID id, String email) {
        log.info("[deleteUser] Attempting to delete user {} with email verification: {}", id, email);
        
        Optional<User> userOptional = userRepository.findById(id);
        if (!userOptional.isPresent()) {
            log.warn("[deleteUser] User with id {} not found", id);
            return false;
        }
        
        User user = userOptional.get();
        
        // Verify email matches for security
        if (!user.getEmail().equals(email)) {
            log.error("[deleteUser] Email verification failed for user {}. Expected: {}, Provided: {}", 
                id, user.getEmail(), email);
            return false;
        }
        
        try {
            userRepository.deleteById(id);
            log.info("[deleteUser] Successfully deleted user {} with email {}", id, email);
            return true;
        } catch (Exception e) {
            log.error("[deleteUser] Failed to delete user {}: {}", id, e.getMessage(), e);
            return false;
        }
    }
}
