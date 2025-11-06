package com.example.courseService.dto.request;

import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateRequest {

    @NotNull(message = "{certificateRequest.courseId.notNull}")
    private UUID courseId;

    @NotNull(message = "{certificateRequest.userId.notNull}")
    private UUID userId;

    @NotBlank(message = "{certificateRequest.verificationCode.notBlank}")
    private String verificationCode;

}
