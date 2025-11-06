package com.example.courseService.model;

import org.javers.core.metamodel.annotation.DiffIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "courseProgress")
@EqualsAndHashCode(exclude = { "lastAccessDate" })
public class CourseProgress {

    @Id
    @DiffIgnore
    private UUID id;
    @DBRef(lazy = true)
    private Course course;
    private UUID userId;
    @DBRef
    private Topic lastAccessedTopic;
    @DBRef
    private Set<Topic> completedTopics;
    private Float overallProgress;
    private LocalDateTime startDate;
    private LocalDateTime lastAccessDate;
}
