package com.example.kafka.coursera.FactoryDTOs;

import com.example.kafka.coursera.DTO.UserDTO;
import com.example.kafka.coursera.db.entities.User;
import com.example.kafka.coursera.db.enums.RoleEnum;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class UserFactoryDTO {

    public UserDTO makeDTO(User user) {
        if (user == null) {
            log.warn("[makeDTO] User is null");
            return null;
        }

        log.info("[makeDTO] Raw user data - firstName: '{}', lastName: '{}', name: '{}', email: '{}', role: '{}'", 
            user.getFirstName(), user.getLastName(), user.getName(), user.getEmail(), user.getRole());

        String firstName = user.getFirstName();
        String lastName = user.getLastName();
        String name = user.getName();

        // If name is not set in database, compute it from first/last name
        if (name == null && (firstName != null || lastName != null)) {
            name = (firstName != null ? firstName : "") + 
                   ((firstName != null && lastName != null) ? " " : "") + 
                   (lastName != null ? lastName : "");
            name = name.trim();
            if (name.isEmpty()) {
                name = null;
            }
        }

        log.info("[makeDTO] Final name values - firstName: '{}', lastName: '{}', name: '{}'", firstName, lastName, name);

        UserDTO.UserDTOBuilder builder = UserDTO.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().toString() : null)
                .status(user.getStatus())
                .firstName(firstName)
                .lastName(lastName)
                .name(name);

        if (user.getRole() == RoleEnum.STUDENT && user.getStudent() != null && user.getStudent().getId() != null) {
            builder.studentId(user.getStudent().getId().toString());
        } else if (user.getSchool() != null && user.getSchool().getId() != null) {
            builder.schoolId(user.getSchool().getId().toString());
        }

        UserDTO dto = builder.build();
        log.info("[makeDTO] Final DTO - email: '{}', firstName: '{}', lastName: '{}', name: '{}', role: '{}'", 
            dto.getEmail(), dto.getFirstName(), dto.getLastName(), dto.getName(), dto.getRole());
        return dto;
    }

    public User makeUserFromDTO(UserDTO userDTO) {
        if (userDTO == null) {
            log.warn("[makeUserFromDTO] UserDTO is null");
            return null;
        }

        log.info("[makeUserFromDTO] Creating User from DTO - email: '{}', firstName: '{}', lastName: '{}', name: '{}', role: '{}'",
            userDTO.getEmail(), userDTO.getFirstName(), userDTO.getLastName(), userDTO.getName(), userDTO.getRole());

        RoleEnum roleEnum = null;
        try {
            if (userDTO.getRole() != null) {
                roleEnum = RoleEnum.valueOf(userDTO.getRole());
            }
        } catch (IllegalArgumentException e) {
            log.warn("[makeUserFromDTO] Invalid role value: '{}'", userDTO.getRole());
        }

        String name = userDTO.getName();
        if (name == null && (userDTO.getFirstName() != null || userDTO.getLastName() != null)) {
            name = (userDTO.getFirstName() != null ? userDTO.getFirstName() : "") + 
                   ((userDTO.getFirstName() != null && userDTO.getLastName() != null) ? " " : "") + 
                   (userDTO.getLastName() != null ? userDTO.getLastName() : "");
            name = name.trim();
            if (name.isEmpty()) {
                name = null;
            }
        }

        User user = User.builder()
                .email(userDTO.getEmail())
                .role(roleEnum)
                .status(userDTO.getStatus())
                .firstName(userDTO.getFirstName())
                .lastName(userDTO.getLastName())
                .name(name)
                .build();

        log.info("[makeUserFromDTO] Created User - email: '{}', firstName: '{}', lastName: '{}', name: '{}', role: '{}'",
            user.getEmail(), user.getFirstName(), user.getLastName(), user.getName(), user.getRole());
        return user;
    }
}