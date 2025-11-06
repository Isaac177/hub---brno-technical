package com.example.courseService.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StudyStatisticsRequestEvent {
    private UUID requestId;
    private String eventType;
    private String replyTo;
}