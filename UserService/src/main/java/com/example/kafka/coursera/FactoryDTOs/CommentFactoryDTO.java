package com.example.kafka.coursera.FactoryDTOs;

import com.example.kafka.coursera.DTO.CommentDTO;
import com.example.kafka.coursera.db.entities.Comment;
import com.example.kafka.coursera.db.repositories.PostRepository;
import com.example.kafka.coursera.exceptions.implementation.ResourceNotFoundException;
import com.example.kafka.coursera.requests.CommentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CommentFactoryDTO {

    public CommentDTO makeDTO(Comment comment, UUID postId) {
        return CommentDTO.builder()
                .id(String.valueOf(comment.getId()))
                .postId(String.valueOf(postId))
                .content(comment.getContent())
                .userEmail(comment.getAuthor().getEmail())
                .build();
    }

    public Comment makeComment(CommentRequest request) {
        return Comment.builder()
                .content(request.getContent())
                .build();
    }
}
