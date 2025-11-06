package com.example.kafka.coursera.db.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"id", "ratings", "avatar"})
public class Instructor {

    @Id
    private UUID id;

    @Email
    private String email;

    @Column(length = 255)
    private String firstName;

    @Column(length = 255)
    private String lastName;

    @Column(length = 255)
    private String fathersName;

    @Column(length = 255)
    private String profession;

    @Lob
    @Size(max = 10000)
    @Column(length = 10000)
    private String bio;

    private File avatar;

    // One Instructor can have many Ratings
    @OneToMany(mappedBy = "instructor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Rating> ratings;
}