package com.example.kafka.coursera.FactoryDTOs;

import com.example.kafka.coursera.DTO.LikeDTO;
import com.example.kafka.coursera.db.entities.Like;
import com.example.kafka.coursera.db.repositories.PostRepository;
import com.example.kafka.coursera.exceptions.implementation.ResourceNotFoundException;
import com.example.kafka.coursera.requests.LikeRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class LikeFactoryDTO {

    public LikeDTO makeDTO(Like like) {
        return LikeDTO.builder()
                .id(String.valueOf(like.getId()))
                .postId(String.valueOf(like.getPost().getId()))
                .userEmail(like.getAuthor().getEmail())
                .build();
    }
}
