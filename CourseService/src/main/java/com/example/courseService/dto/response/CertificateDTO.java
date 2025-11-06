package com.example.courseService.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CertificateDTO {
    private UUID id;
    private UUID courseId;
    private UUID userId;
    private LocalDateTime issueDate;
    private String certificateUrl;
    private String verificationCode;
}
