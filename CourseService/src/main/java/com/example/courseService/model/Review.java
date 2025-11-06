package com.example.courseService.model;

import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(exclude = { "id", "course", "updatedAt", "userId", "helpfulVotes", "createdAt" })
@Document(collection = "reviews")
public class Review {

    @Id
    private UUID id;

    @DBRef
    @NotNull(message = "Course must not be null")
    private Course course;

    @NotNull(message = "User ID must not be null")
    private UUID userId;

    @NotNull(message = "Rating must not be null")
    private Integer rating;

    @NotBlank(message = "Comment must not be null")
    private String comment;

    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @NotNull(message = "Verified purchase status must not be null")
    private Boolean isVerifiedPurchase;

    private Integer helpfulVotes = 0;
}
