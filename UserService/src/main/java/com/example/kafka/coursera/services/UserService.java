package com.example.kafka.coursera.services;

import com.example.kafka.coursera.DTO.UserDTO;
import com.example.kafka.coursera.db.entities.User;
import com.example.kafka.coursera.db.enums.StatusEnum;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserDTO findById(UUID id);
    UserDTO findByEmail(String email);
    List<UserDTO> findByIds(List<UUID> ids);
    List<UserDTO> findAll(int page, int size);
    void deleteById(UUID id);
    List<UserDTO> findByEmails(List<String> emails);
    UserDTO updateUserStatus(UUID id, StatusEnum status);
    boolean deleteUser(UUID id, String email);
}
