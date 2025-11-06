package com.example.kafka.coursera.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;
import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StudyStatisticsResponseDTO {
    private UUID requestId;
    private String service;
    private boolean success;
    private Map<String, Object> statistics;
    private String error;
    
    public static StudyStatisticsResponseDTO success(UUID requestId, Map<String, Object> statistics) {
        return StudyStatisticsResponseDTO.builder()
                .requestId(requestId)
                .service("UserService")
                .success(true)
                .statistics(statistics)
                .build();
    }
    
    public static StudyStatisticsResponseDTO error(UUID requestId, String error) {
        return StudyStatisticsResponseDTO.builder()
                .requestId(requestId)
                .service("UserService")
                .success(false)
                .error(error)
                .build();
    }
}