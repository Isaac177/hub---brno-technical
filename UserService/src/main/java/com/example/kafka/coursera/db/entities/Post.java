package com.example.kafka.coursera.db.entities;

import com.example.kafka.coursera.db.enums.PostType;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "posts")
public class Post {
    @Id
    private UUID id;
    private String title;
    private String content;
    private PostType type;

    @ManyToOne
    @JoinColumn
    private User author;

    private Instant createdAt;
    private Instant updatedAt;

    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY)
    private List<Comment> comments;

    @OneToMany(mappedBy = "post")
    private List<Like> likes;

    @ManyToOne
    @JoinColumn
    private Category category;

    private File image;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        id = UUID.randomUUID();
        comments = new ArrayList<>();
        likes = new ArrayList<>();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
