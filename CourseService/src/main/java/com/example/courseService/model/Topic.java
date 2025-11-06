package com.example.courseService.model;


import java.time.Duration;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.DBRef;

@Getter
@Setter
@NoArgsConstructor
@Entity
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = { "id", "module"})
public class Topic {
    @Id
    private UUID id;

    private String title;
    private String videoUrl;

    private Duration duration;

    @DBRef(lazy = false)
    @JsonIgnore
    private Module module;


    private boolean isPreview;

}