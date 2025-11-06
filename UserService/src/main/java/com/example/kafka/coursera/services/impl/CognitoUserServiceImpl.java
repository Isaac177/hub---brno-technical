package com.example.kafka.coursera.services.impl;

import com.example.kafka.coursera.db.entities.User;
import com.example.kafka.coursera.db.entities.UserPreferences;
import com.example.kafka.coursera.db.enums.LanguageEnum;
import com.example.kafka.coursera.db.enums.RoleEnum;
import com.example.kafka.coursera.db.enums.StatusEnum;
import com.example.kafka.coursera.db.repositories.UserRepository;
import com.example.kafka.coursera.db.repositories.UserPreferencesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CognitoUserServiceImpl {
    private final UserRepository userRepository;
    private final UserPreferencesRepository userPreferencesRepository;

    @Transactional
    public User createOrUpdateUserFromCognito(Map<String, Object> cognitoUserData) {
        try {
            if (cognitoUserData == null) {
                throw new IllegalArgumentException("Cognito user data cannot be null");
            }

            @SuppressWarnings("unchecked")
            Map<String, String> attributes = (Map<String, String>) cognitoUserData.get("Attributes");
            if (attributes == null) {
                throw new IllegalArgumentException("User attributes cannot be null");
            }

            String email = attributes.get("email");
            if (email == null) {
                throw new IllegalArgumentException("User email cannot be null");
            }

            // First try to find user by email
            User user = userRepository.findByEmail(email).orElse(new User());

            // If it's a new user, use the Cognito sub as UUID
            if (user.getId() == null) {
                user.setId(UUID.fromString(attributes.get("sub")));
                user.setCreatedAt(Instant.now());
            }

            // Update user information
            user.setEmail(email);
            user.setFirstName(attributes.get("given_name"));
            user.setLastName(attributes.get("family_name"));
            user.setMiddleName(attributes.get("middle_name"));
            user.setStatus(StatusEnum.ACTIVE);
            user.setRole(RoleEnum.valueOf(attributes.getOrDefault("role", "STUDENT")));
            user.setEmailVerified(Boolean.parseBoolean(attributes.getOrDefault("email_verified", "false")));
            user.setLastLoginAt(Instant.now());

            if (user.getUpdatedAt() == null) {
                user.setUpdatedAt(Instant.now());
            } else {
                user.setUpdatedAt(Instant.now());
            }

            // Save user first
            user = userRepository.save(user);

            // Create or update user preferences
            UserPreferences preferences = userPreferencesRepository.findByUser(user)
                    .orElse(new UserPreferences());
            
            if (preferences.getId() == null) {
                preferences.setId(UUID.randomUUID());
                preferences.setUser(user);
                preferences.setLanguage(LanguageEnum.EN);
                preferences.setEmailNotifications(true);
                preferences.setMarketingCommunications(false);
                preferences.setPushNotifications(true);
                preferences.setCreatedAt(Instant.now());
            }
            preferences.setUpdatedAt(Instant.now());

            userPreferencesRepository.save(preferences);

            log.info("Successfully created/updated user with email: {}", email);
            return user;

        } catch (Exception e) {
            log.error("Error processing Cognito user data: {}", e.getMessage());
            throw e;
        }
    }

    @Transactional
    public void updateLastLoginTime(String email) {
        try {
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setLastLoginAt(Instant.now());
                user.setUpdatedAt(Instant.now());
                userRepository.save(user);
                log.info("Updated last login time for user with email: {}", email);
            } else {
                log.warn("User not found with email: {}", email);
            }
        } catch (Exception e) {
            log.error("Error updating last login time: {}", e.getMessage());
            throw e;
        }
    }
}
