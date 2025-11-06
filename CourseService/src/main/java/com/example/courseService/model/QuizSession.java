package com.example.courseService.model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "quiz_sessions")
@CompoundIndex(name = "unique_quiz_user_idx", def = "{'quizId' : 1, 'userId': 1}", unique = true)
@Builder
public class QuizSession {

    @Id
    private UUID id;
    @NotNull
    private UUID userId;
    @NotNull
    private UUID quizId;
    @NotNull
    private Long startTime; // Время начала квиза в миллисекундах
    @NotNull
    private Boolean isCompleted; // Завершен ли квиз

    private Long finishedIn;

    private LocalDateTime submitedAt;

    private Integer points = 0;
}
