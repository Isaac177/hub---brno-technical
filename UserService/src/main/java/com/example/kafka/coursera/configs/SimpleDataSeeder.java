package com.example.kafka.coursera.configs;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.kafka.coursera.db.entities.Student;
import com.example.kafka.coursera.db.entities.User;
import com.example.kafka.coursera.db.enums.RoleEnum;
import com.example.kafka.coursera.db.enums.StatusEnum;
import com.example.kafka.coursera.db.repositories.StudentRepository;
import com.example.kafka.coursera.db.repositories.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class SimpleDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if no students exist
        if (studentRepository.count() > 0) {
            log.info("Students already exist, skipping data seeding");
            return;
        }

        log.info("Creating sample students...");
        
        // Create sample users and students
        createSampleStudent("john.doe@example.com", "John", "Doe", "New York", "USA");
        createSampleStudent("jane.smith@example.com", "Jane", "Smith", "Los Angeles", "USA");
        createSampleStudent("mike.johnson@example.com", "Mike", "Johnson", "Chicago", "USA");
        createSampleStudent("sarah.wilson@example.com", "Sarah", "Wilson", "Houston", "USA");
        createSampleStudent("david.brown@example.com", "David", "Brown", "Phoenix", "USA");

        log.info("Sample students created successfully");
    }

    private void createSampleStudent(String email, String firstName, String lastName, String city, String country) {
        // Create user
        User user = User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .name(firstName + " " + lastName)
                .emailVerified(true)
                .role(RoleEnum.STUDENT)
                .status(StatusEnum.ACTIVE)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        user = userRepository.save(user);

        // Create student
        Student student = Student.builder()
                .id(UUID.randomUUID())
                .firstName(firstName)
                .lastName(lastName)
                .fathersName(firstName.substring(0, 1) + ". Father")
                .dateOfBirth(LocalDate.of(1995, 1, 1))
                .phoneNumber("+1-555-" + String.format("%04d", (int)(Math.random() * 9999)))
                .address("123 " + lastName + " Street")
                .city(city)
                .country(country)
                .user(user)
                .build();
        studentRepository.save(student);

        log.info("Created student: {} {} ({})", firstName, lastName, email);
    }
}