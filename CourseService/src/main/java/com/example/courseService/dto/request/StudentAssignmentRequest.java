package com.example.courseService.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class StudentAssignmentRequest {

    @NotNull(message = "{studentAssignment.assignmentId.notNull}")
    private UUID assignmentId;

    @NotNull(message = "{studentAssignment.studentId.notNull}")
    private UUID studentId;

    @Size(max = 500, message = "{studentAssignment.textInput.size}")
    private String textInput;
}
