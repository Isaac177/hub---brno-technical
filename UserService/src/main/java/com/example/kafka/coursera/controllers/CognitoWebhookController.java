package com.example.kafka.coursera.controllers;

import com.example.kafka.coursera.services.impl.CognitoUserServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cognito-webhook")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CognitoWebhookController {
    private final CognitoUserServiceImpl cognitoUserService;

    @PostMapping("/post-confirmation")
    @CrossOrigin(origins = "*", allowedHeaders = "*")
    public ResponseEntity<?> handlePostConfirmation(@RequestBody Map<String, Object> event) {
        try {
            Map<String, Object> request = (Map<String, Object>) event.get("request");
            Map<String, Object> userAttributes = (Map<String, Object>) request.get("userAttributes");

            Map<String, Object> cognitoUserData = new HashMap<>();
            cognitoUserData.put("Username", userAttributes.get("sub"));
            cognitoUserData.put("UserStatus", "CONFIRMED");
            cognitoUserData.put("Enabled", true);
            cognitoUserData.put("UserCreateDate", event.get("triggerSource") != null &&
                event.get("triggerSource").equals("PostConfirmation_ConfirmSignUp") ?
                request.get("timestamp") : userAttributes.get("createDate"));
            cognitoUserData.put("UserLastModifiedDate", request.get("timestamp"));
            cognitoUserData.put("Attributes", userAttributes);

            cognitoUserService.createOrUpdateUserFromCognito(cognitoUserData);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error processing Cognito post confirmation webhook", e);
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping("/post-authentication")
    @CrossOrigin(origins = "*", allowedHeaders = "*")
    public ResponseEntity<?> handlePostAuthentication(@RequestBody Map<String, Object> event) {
        try {
            Map<String, Object> request = (Map<String, Object>) event.get("request");
            Map<String, Object> userAttributes = (Map<String, Object>) request.get("userAttributes");

            String email = (String) userAttributes.get("email");

            cognitoUserService.updateLastLoginTime(email);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error processing Cognito post authentication webhook", e);
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
