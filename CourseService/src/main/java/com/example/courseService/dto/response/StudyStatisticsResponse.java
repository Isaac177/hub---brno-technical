package com.example.courseService.dto.response;

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
public class StudyStatisticsResponse {
    private UUID requestId;
    private boolean success;
    private Map<String, Object> courseStatistics;
    private Map<String, Object> userStatistics;
    private Map<String, Object> enrollmentStatistics;
    private String error;
    
    public static StudyStatisticsResponse success(UUID requestId, 
                                                 Map<String, Object> courseStats, 
                                                 Map<String, Object> userStats, 
                                                 Map<String, Object> enrollmentStats) {
        return StudyStatisticsResponse.builder()
                .requestId(requestId)
                .success(true)
                .courseStatistics(courseStats)
                .userStatistics(userStats)
                .enrollmentStatistics(enrollmentStats)
                .build();
    }
    
    public static StudyStatisticsResponse error(UUID requestId, String error) {
        return StudyStatisticsResponse.builder()
                .requestId(requestId)
                .success(false)
                .error(error)
                .build();
    }
}