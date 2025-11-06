package com.example.kafka.coursera.db.entities;

import com.example.kafka.coursera.db.enums.LanguageLevel;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "languages")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class Language {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String language;
    @Enumerated(EnumType.STRING)
    private LanguageLevel level;

    @ManyToOne
    @JoinColumn
    private Student student;
}
