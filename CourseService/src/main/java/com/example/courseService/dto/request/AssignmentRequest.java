package com.example.courseService.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

import com.example.courseService.enums.AssignmentFormat;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentRequest {

    @NotNull(message = "{assignmentRequest.lessonId.notNull}")
    private UUID sectionId;

    @NotBlank(message = "{assignmentRequest.title.notBlank}")
    @Size(min = 6, message = "{assignmentRequest.title.size}")
    private String title;

    private String description;

    @NotNull(message = "{assignmentRequest.dueDate.notNull}")
    private Instant dueDate;

    @NotNull(message = "{assignmentRequest.maxScore.notNull}")
    @Min(value = 0, message = "{assignmentRequest.maxScore.min}")
    private Integer maxScore;

    @NotNull
    private AssignmentFormat format;

    @Min(value = 1)
    private Integer attempts;
}
