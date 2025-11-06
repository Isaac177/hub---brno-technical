package com.example.courseService.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewRequest {

    @NotNull(message = "{reviewRequest.courseId.notNull}")
    private UUID courseId;

    @NotNull(message = "{reviewRequest.userId.notNull}")
    private UUID userId;

    @NotNull(message = "{reviewRequest.rating.notNull}")
    @Min(value = 1, message = "{reviewRequest.rating.min}")
    private Integer rating;

    @NotBlank(message = "{reviewRequest.comment.notBlank}")
    private String comment;

    @NotNull(message = "{reviewRequest.isVerifiedPurchase.notNull}")
    private Boolean isVerifiedPurchase;
}
