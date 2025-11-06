package com.example.kafka.coursera.services;

import com.example.kafka.coursera.DTO.LikeDTO;
import com.example.kafka.coursera.FactoryDTOs.LikeFactoryDTO;
import com.example.kafka.coursera.db.entities.Like;
import com.example.kafka.coursera.db.entities.Post;
import com.example.kafka.coursera.db.entities.User;
import com.example.kafka.coursera.db.repositories.LikeRepository;
import com.example.kafka.coursera.db.repositories.PostRepository;
import com.example.kafka.coursera.db.repositories.UserRepository;
import com.example.kafka.coursera.exceptions.implementation.ResourceNotFoundException;
import com.example.kafka.coursera.requests.LikeRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final PostRepository postRepository;
    private final LikeRepository repository;
    private final UserRepository userRepository;
    private final LikeFactoryDTO factoryDTO;

    public LikeDTO likePost(LikeRequest request) throws Exception {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Like like = new Like();

        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        like.setPost(post);
        like.setAuthor(user);
        like = repository.save(like);
        user.getLikes().add(like);

        LikeDTO likeDTO = factoryDTO.makeDTO(like);
        likeDTO.setMessage("Like liked");

        return likeDTO;
    }

    public void deleteLike(UUID likeID) {
        Like like = repository.findById(likeID).orElseThrow(() -> new ResourceNotFoundException("Like doesnt exist"));
        repository.delete(like);
    }
}
