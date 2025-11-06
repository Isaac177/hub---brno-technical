package com.example.kafka.coursera.controllers;

import com.example.kafka.coursera.DTO.UserDTO;
import com.example.kafka.coursera.db.enums.StatusEnum;
import com.example.kafka.coursera.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @GetMapping("/byEmail/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        UserDTO user = userService.findByEmail(email);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @PostMapping("/batch")
    public ResponseEntity<Map<String, List<UserDTO>>> getBatchUsers(@RequestBody Map<String, List<String>> request) {
        List<String> userIds = request.get("userIds");
        if (userIds == null || userIds.isEmpty()) {
            return ResponseEntity.ok(Map.of("users", Collections.emptyList()));
        }

        List<UUID> uuidList = userIds.stream()
            .map(UUID::fromString)
            .collect(Collectors.toList());

        List<UserDTO> users = userService.findByIds(uuidList);
        return ResponseEntity.ok(Map.of("users", users));
    }

    @PostMapping("/batch-by-email")
    public ResponseEntity<Map<String, List<UserDTO>>> getBatchUsersByEmail(@RequestBody Map<String, List<String>> request) {
        List<String> emails = request.get("emails");
        if (emails == null || emails.isEmpty()) {
            return ResponseEntity.ok(Map.of("users", Collections.emptyList()));
        }

        List<UserDTO> users = userService.findByEmails(emails);
        return ResponseEntity.ok(Map.of("users", users));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserDTO> updateUserStatus(@PathVariable UUID id, @RequestBody Map<String, String> request) {
        try {
            String statusValue = request.get("status");
            if (statusValue == null) {
                return ResponseEntity.badRequest().build();
            }

            StatusEnum status;
            try {
                status = StatusEnum.valueOf(statusValue.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.error("Invalid status value: {}", statusValue);
                return ResponseEntity.badRequest().build();
            }

            UserDTO updatedUser = userService.updateUserStatus(id, status);
            if (updatedUser != null) {
                log.info("Updated user {} status to {}", id, status);
                return ResponseEntity.ok(updatedUser);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error updating user status: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable UUID id, @RequestBody String email) {
        try {
            boolean deleted = userService.deleteUser(id, email);
            if (deleted) {
                log.info("Successfully deleted user with id: {}", id);
                return ResponseEntity.ok("User deleted successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error deleting user: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
