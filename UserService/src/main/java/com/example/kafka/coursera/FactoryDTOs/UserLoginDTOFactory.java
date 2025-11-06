package com.example.kafka.coursera.FactoryDTOs;

import com.example.kafka.coursera.DTO.UserLoginDTO;
import com.example.kafka.coursera.db.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserLoginDTOFactory {
    public UserLoginDTO makeDTO(User user, String text) {
        if (user.getStudent() != null) {
            return UserLoginDTO.builder()
                    .id(String.valueOf(user.getId()))
                    .email(user.getEmail())
                    .statusCode(200)
                    .message(text)
                    .studentId(String.valueOf(user.getStudent().getId()))
                    .build();
        }
        return UserLoginDTO.builder()
                .id(String.valueOf(user.getId()))
                .email(user.getEmail())
                .statusCode(200)
                .message(text)
                .schoolId(String.valueOf(user.getSchool().getId()))
                .build();
    }
}
