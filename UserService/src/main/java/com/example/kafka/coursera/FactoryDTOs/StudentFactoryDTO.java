package com.example.kafka.coursera.FactoryDTOs;

import com.example.kafka.coursera.DTO.StudentDTO;
import com.example.kafka.coursera.db.entities.Student;
import com.example.kafka.coursera.requests.StudentProfileRequest;
import com.example.kafka.coursera.requests.StudentRegisterRequest;

import java.time.LocalDate;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class StudentFactoryDTO {
    public StudentDTO makeDTO(Student student) {
        if (student == null) {
            return null; // or throw an exception if preferred
        }

        return StudentDTO.builder()
                .id(Optional.ofNullable(student.getId()).map(Object::toString).orElse(null))
                .phoneNumber(Optional.ofNullable(student.getPhoneNumber()).orElse(null))
                .lastName(Optional.ofNullable(student.getLastName()).orElse(null))
                .firstName(Optional.ofNullable(student.getFirstName()).orElse(null))
                .city(Optional.ofNullable(student.getCity()).orElse(null))
                .dateOfBirth(Optional.ofNullable(student.getDateOfBirth()).map(LocalDate::toString).orElse(null))
                .address(Optional.ofNullable(student.getAddress()).orElse(null))
                .country(Optional.ofNullable(student.getCountry()).orElse(null))
                .email(Optional.ofNullable(student.getUser())
                        .map(user -> user.getEmail())
                        .orElse(null))
                .profilePictureUrl(Optional.ofNullable(student.getPicture())
                        .map(picture -> picture.getUrl())
                        .orElse(null))
                .build();
    }

    public StudentDTO makeDTO(Student student, String text) {
        if (student == null) {
            return null; // or throw an exception if preferred
        }

        return StudentDTO.builder()
                .id(Optional.ofNullable(student.getId()).map(Object::toString).orElse(null))
                .phoneNumber(Optional.ofNullable(student.getPhoneNumber()).orElse(null))
                .lastName(Optional.ofNullable(student.getLastName()).orElse(null))
                .firstName(Optional.ofNullable(student.getFirstName()).orElse(null))
                .fathersName(Optional.ofNullable(student.getFathersName()).orElse(null))
                .city(Optional.ofNullable(student.getCity()).orElse(null))
                .dateOfBirth(Optional.ofNullable(student.getDateOfBirth()).map(LocalDate::toString).orElse(null))
                .address(Optional.ofNullable(student.getAddress()).orElse(null))
                .country(Optional.ofNullable(student.getCountry()).orElse(null))
                .email(Optional.ofNullable(student.getUser())
                        .map(user -> user.getEmail())
                        .orElse(null))
                .profilePictureUrl(Optional.ofNullable(student.getPicture())
                        .map(picture -> picture.getUrl())
                        .orElse(null))
                .message(Optional.ofNullable(text).orElse(null))
                .build();
    }

    public Student toEntity(StudentProfileRequest request) {
        if (request == null) {
            return null;
        }

        return Student.builder()
                .id(Optional.ofNullable(request.getId()).orElse(null)) // Handle null id
                .firstName(Optional.ofNullable(request.getFirstName()).orElse(null))
                .lastName(Optional.ofNullable(request.getLastName()).orElse(null))
                .fathersName(Optional.ofNullable(request.getFathersName()).orElse(null))
                .dateOfBirth(Optional.ofNullable(request.getDateOfBirth())
                        .map(LocalDate::parse).orElse(null)) // Handle null date parsing
                .phoneNumber(Optional.ofNullable(request.getPhoneNumber()).orElse(null))
                .address(Optional.ofNullable(request.getAddress()).orElse(null))
                .city(Optional.ofNullable(request.getCity()).orElse(null))
                .country(Optional.ofNullable(request.getCountry()).orElse(null))
                .build();
    }

    public Student toEntity(StudentRegisterRequest request) {
        return Student.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .fathersName(request.getFathersName())
                .dateOfBirth(request.getDateOfBirth())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .build();
    }

    public void updateEntity(StudentRegisterRequest request, Student student) {
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setFathersName(request.getFathersName());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setPhoneNumber(request.getPhoneNumber());
        student.setAddress(request.getAddress());
        student.setCity(request.getCity());
        student.setCountry(request.getCountry());
    }

}
