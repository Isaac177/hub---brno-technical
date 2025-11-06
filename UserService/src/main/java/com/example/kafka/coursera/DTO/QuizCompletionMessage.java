package com.example.kafka.coursera.DTO;

import com.example.kafka.coursera.DTO.deserializers.NestedDateTimeDeserializer;
import com.example.kafka.coursera.DTO.deserializers.NestedValueDeserializer;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class QuizCompletionMessage {
    @JsonProperty("userId")
    private String userId;
    
    @JsonProperty("courseId")
    private String courseId;
    
    @JsonProperty("quizId")
    @JsonDeserialize(using = NestedValueDeserializer.class)
    private String quizId;
    
    @JsonProperty("score")
    private int score;
    
    @JsonProperty("timeElapsed")
    @JsonDeserialize(using = NestedValueDeserializer.class)
    private long timeElapsed;
    
    @JsonProperty("passed")
    private boolean passed;
    
    @JsonProperty("completedAt")
    @JsonDeserialize(using = NestedDateTimeDeserializer.class)
    private LocalDateTime completedAt;
    
    @JsonProperty("firstAttempt")
    private boolean firstAttempt;
    
    @JsonProperty("perfectScore")
    private boolean perfectScore;
}
