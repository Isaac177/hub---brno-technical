package com.example.kafka.coursera.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = {
    "com.example.kafka.coursera.db.repositories",
    "com.example.kafka.coursera.repository"
})
@EntityScan(basePackages = {
    "com.example.kafka.coursera.db.entities",
    "com.example.kafka.coursera.model"
})
public class JpaConfig {
}
