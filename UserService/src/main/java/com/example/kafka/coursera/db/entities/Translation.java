package com.example.kafka.coursera.db.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "translations")
@Data
public class Translation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(name = "en_text")
    private String en;

    @Column(name = "ru_text")
    private String ru;

    @Column(name = "es_text")
    private String es;
}
