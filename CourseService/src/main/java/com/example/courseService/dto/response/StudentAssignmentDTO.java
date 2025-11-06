package com.example.courseService.dto.response;

import java.time.Instant;
import java.util.UUID;

import com.example.courseService.model.File;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentAssignmentDTO {

    private UUID id;

    private UUID assignmentId;

    private UUID studentId;

    private Double points;

    private Instant submittedTime;

    private Integer attempts;

    private String textInput;

    private File file;

    private boolean checked;
}
