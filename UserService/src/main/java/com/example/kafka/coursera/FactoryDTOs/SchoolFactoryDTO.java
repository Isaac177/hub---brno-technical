package com.example.kafka.coursera.FactoryDTOs;

import com.example.kafka.coursera.DTO.SchoolDTO;
import com.example.kafka.coursera.db.entities.File;
import com.example.kafka.coursera.db.entities.School;
import com.example.kafka.coursera.requests.SchoolRequest;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class SchoolFactoryDTO {
        public SchoolDTO makeDTO(School school) {
                return SchoolDTO.builder()
                        .id(Optional.ofNullable(school.getId()).map(Object::toString).orElse(null))
                        .name(Optional.ofNullable(school.getName()).orElse("N/A"))
                        .email(Optional.ofNullable(school.getEmail()).orElse("N/A"))
                        .city(Optional.ofNullable(school.getCity()).orElse("N/A"))
                        .address(Optional.ofNullable(school.getAddress()).orElse("N/A"))
                        .country(Optional.ofNullable(school.getCountry()).orElse("N/A"))
                        .primaryContactUserEmail(Optional.ofNullable(school.getPrimaryContactUser())
                                .map(user -> user.getEmail())
                                .orElse(null))
                        .status(Optional.ofNullable(school.getStatus()).map(Enum::toString).orElse("UNKNOWN"))
                        .website(Optional.ofNullable(school.getWebsite()).orElse("N/A"))
                        .foundedYear(Optional.ofNullable(school.getFoundedYear()).orElse(null))
                        .logoUrl(Optional.ofNullable(school.getLogo()).map(logo -> logo.getUrl()).orElse(null))
                        .phoneNumber(Optional.ofNullable(school.getPhoneNumber()).orElse("N/A"))
                        .description(Optional.ofNullable(school.getDescription()).orElse("N/A"))
                        .build();
        }

        public SchoolDTO makeDTO(School school, String text) {
                return SchoolDTO.builder()
                        .id(Optional.ofNullable(school.getId()).map(Object::toString).orElse(null))
                        .name(Optional.ofNullable(school.getName()).orElse("N/A"))
                        .email(Optional.ofNullable(school.getEmail()).orElse("N/A"))
                        .city(Optional.ofNullable(school.getCity()).orElse("N/A"))
                        .address(Optional.ofNullable(school.getAddress()).orElse("N/A"))
                        .country(Optional.ofNullable(school.getCountry()).orElse("N/A"))
                        .primaryContactUserEmail(Optional.ofNullable(school.getPrimaryContactUser())
                                .map(user -> user.getEmail())
                                .orElse(null))
                        .status(Optional.ofNullable(school.getStatus()).map(Enum::toString).orElse("UNKNOWN"))
                        .website(Optional.ofNullable(school.getWebsite()).orElse("N/A"))
                        .foundedYear(Optional.ofNullable(school.getFoundedYear()).orElse(null))
                        .logoUrl(Optional.ofNullable(school.getLogo()).map(logo -> logo.getUrl()).orElse(null))
                        .phoneNumber(Optional.ofNullable(school.getPhoneNumber()).orElse("N/A"))
                        .description(Optional.ofNullable(school.getDescription()).orElse("N/A"))
                        .message(text)
                        .build();
        }

        public School makeSchool(SchoolRequest request, File logo) {
                // Updated to include email and remove primaryContactUser dependency
                return School.builder()
                        .name(request.getName())
                        .email(request.getEmail() != null ? request.getEmail() : "")
                        .description(request.getDescription() != null ? request.getDescription() : "")
                        .website(request.getWebsite() != null ? request.getWebsite() : "")
                        .foundedYear(request.getFoundedYear())
                        .logo(logo)
                        .address(request.getAddress())
                        .city(request.getCity())
                        .country(request.getCountry())
                        .phoneNumber(request.getPhoneNumber())
                        .build();
        }
}
