package com.example.courseService.dto.response;

import java.time.Instant;
import java.util.UUID;

import com.example.courseService.enums.AssignmentFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentDTO {

    private UUID id;
    private UUID sectionId;
    private String title;
    private String description;
    private Instant dueDate;
    private Integer maxScore;
    private Integer attempts;
    private AssignmentFormat format;
}
