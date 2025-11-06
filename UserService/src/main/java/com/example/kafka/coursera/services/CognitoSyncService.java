package com.example.kafka.coursera.services;

import com.amazonaws.services.cognitoidp.AWSCognitoIdentityProvider;
import com.amazonaws.services.cognitoidp.AWSCognitoIdentityProviderClientBuilder;
import com.amazonaws.services.cognitoidp.model.AttributeType;
import com.amazonaws.services.cognitoidp.model.ListUsersRequest;
import com.amazonaws.services.cognitoidp.model.ListUsersResult;
import com.amazonaws.services.cognitoidp.model.UserType;
import com.example.kafka.coursera.db.entities.User;
import com.example.kafka.coursera.db.entities.UserPreferences;
import com.example.kafka.coursera.db.enums.LanguageEnum;
import com.example.kafka.coursera.db.enums.RoleEnum;
import com.example.kafka.coursera.db.enums.StatusEnum;
import com.example.kafka.coursera.db.repositories.UserRepository;
import com.example.kafka.coursera.db.repositories.UserPreferencesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CognitoSyncService {

    private final UserRepository userRepository;
    private final UserPreferencesRepository userPreferencesRepository;

    @Value("${aws.cognito.userPoolId}")
    private String userPoolId;

    @Value("${aws.cognito.region}")
    private String region;

    @Transactional
    public List<User> syncAllCognitoUsers() {
        log.info("Starting sync of all Cognito users");
        
        try {
            AWSCognitoIdentityProvider cognitoClient = AWSCognitoIdentityProviderClientBuilder.standard()
                    .withRegion(region)
                    .build();

            List<UserType> cognitoUsers = getAllCognitoUsers(cognitoClient);
            log.info("Found {} users in Cognito", cognitoUsers.size());

            List<User> syncedUsers = cognitoUsers.stream()
                    .map(this::createOrUpdateUserFromCognito)
                    .collect(Collectors.toList());

            log.info("Successfully synced {} users from Cognito", syncedUsers.size());
            return syncedUsers;

        } catch (Exception e) {
            log.error("Error syncing users from Cognito: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to sync users from Cognito", e);
        }
    }

    private List<UserType> getAllCognitoUsers(AWSCognitoIdentityProvider cognitoClient) {
        List<UserType> allUsers = new java.util.ArrayList<>();
        String paginationToken = null;
        
        do {
            ListUsersRequest request = new ListUsersRequest()
                    .withUserPoolId(userPoolId)
                    .withLimit(60); // Maximum allowed by AWS
            
            if (paginationToken != null) {
                request.withPaginationToken(paginationToken);
            }
            
            ListUsersResult result = cognitoClient.listUsers(request);
            allUsers.addAll(result.getUsers());
            paginationToken = result.getPaginationToken();
            
        } while (paginationToken != null);
        
        return allUsers;
    }

    private User createOrUpdateUserFromCognito(UserType cognitoUser) {
        try {
            String email = getAttributeValue(cognitoUser.getAttributes(), "email");
            if (email == null) {
                log.warn("Skipping user without email: {}", cognitoUser.getUsername());
                return null;
            }

            // Find existing user or create new one
            User user = userRepository.findByEmail(email).orElse(new User());
            boolean isNewUser = user.getId() == null;
            
            // Set user data from Cognito
            if (isNewUser) {
                user.setId(UUID.fromString(getAttributeValue(cognitoUser.getAttributes(), "sub")));
                user.setCreatedAt(cognitoUser.getUserCreateDate().toInstant());
            }

            user.setEmail(email);
            user.setFirstName(getAttributeValue(cognitoUser.getAttributes(), "given_name"));
            user.setLastName(getAttributeValue(cognitoUser.getAttributes(), "family_name"));
            user.setMiddleName(getAttributeValue(cognitoUser.getAttributes(), "middle_name"));
            
            // Set status based on Cognito user status
            switch (cognitoUser.getUserStatus()) {
                case "CONFIRMED":
                    user.setStatus(StatusEnum.ACTIVE);
                    break;
                case "UNCONFIRMED":
                case "RESET_REQUIRED":
                    user.setStatus(StatusEnum.INACTIVE);
                    break;
                default:
                    user.setStatus(StatusEnum.INACTIVE);
            }
            
            // Only set role for new users - preserve existing role for existing users
            if (isNewUser) {
                String roleValue = getAttributeValue(cognitoUser.getAttributes(), "custom:role");
                if (roleValue == null) {
                    roleValue = "STUDENT";
                }
                try {
                    user.setRole(RoleEnum.valueOf(roleValue.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid role '{}' for new user {}, defaulting to STUDENT", roleValue, email);
                    user.setRole(RoleEnum.STUDENT);
                }
                log.debug("Set role {} for new user: {}", user.getRole(), email);
            } else {
                log.debug("Preserving existing role {} for user: {}", user.getRole(), email);
            }
            
            user.setEmailVerified("true".equals(getAttributeValue(cognitoUser.getAttributes(), "email_verified")));
            user.setUpdatedAt(cognitoUser.getUserLastModifiedDate() != null ? 
                cognitoUser.getUserLastModifiedDate().toInstant() : Instant.now());

            // Save user
            user = userRepository.save(user);

            // Create or update user preferences
            createOrUpdateUserPreferences(user);

            log.debug("Successfully synced user: {}", email);
            return user;

        } catch (Exception e) {
            log.error("Error syncing user from Cognito: {}", e.getMessage(), e);
            return null;
        }
    }

    private void createOrUpdateUserPreferences(User user) {
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
    }

    private String getAttributeValue(List<AttributeType> attributes, String attributeName) {
        return attributes.stream()
                .filter(attr -> attributeName.equals(attr.getName()))
                .findFirst()
                .map(AttributeType::getValue)
                .orElse(null);
    }
}