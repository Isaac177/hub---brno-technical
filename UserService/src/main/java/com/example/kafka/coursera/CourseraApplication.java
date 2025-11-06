package com.example.kafka.coursera;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.example.kafka.coursera")
@EnableJpaRepositories(basePackages = {
    "com.example.kafka.coursera.db.repositories",
    "com.example.kafka.coursera.repository"
})
@EntityScan(basePackages = {
    "com.example.kafka.coursera.db.entities",
    "com.example.kafka.coursera.model"
})
public class CourseraApplication {

    public static void main(String[] args) {
        SpringApplication.run(CourseraApplication.class, args);
    }

}
