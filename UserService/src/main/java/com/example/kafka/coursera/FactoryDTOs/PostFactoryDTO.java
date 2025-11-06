package com.example.kafka.coursera.FactoryDTOs;

import java.util.Collections;

import org.springframework.stereotype.Component;

import com.example.kafka.coursera.DTO.PostDTO;
import com.example.kafka.coursera.db.entities.Post;
import com.example.kafka.coursera.db.enums.PostType;
import com.example.kafka.coursera.requests.PostRequest;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PostFactoryDTO {
    private final CommentFactoryDTO commentFactoryDTO;
    private final LikeFactoryDTO likeFactoryDTO;

    public PostDTO makeFullDTO(Post post) {
        if (post == null) {
            return null; // Or throw an exception, depending on your requirements
        }

        return PostDTO.builder()
                .id(String.valueOf(post.getId())) // If `id` is a long, this is fine
                .type(post.getType() != null ? post.getType().name() : null) // Handle null enum
                .content(post.getContent())
                .title(post.getTitle())
                .authorName(post.getAuthor().getEmail())
                .likes(post.getLikes() != null ? post.getLikes().parallelStream()
                        .map(likeFactoryDTO::makeDTO)
                        .toList() : Collections.emptyList()) // Handle null likes list
                .commentList(post.getComments() != null ? post.getComments().parallelStream()
                        .map(c -> commentFactoryDTO.makeDTO(c, post.getId()))
                        .toList() : Collections.emptyList()) // Handle null comments list
                .authorId(post.getAuthor() != null ? String.valueOf(post.getAuthor().getId()) : null) // Handle null// author
                .imageUrl(post.getImage() != null ? post.getImage().getUrl() : null) // Handle null image
                .build();
    }

    public Post makePost(PostRequest request) {
        PostType postType = null;
        try {
            postType = PostType.valueOf(request.getType());
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid post type: " + request.getType());
        }

        return Post.builder()
                .content(request.getContent())
                .title(request.getTitle())
                .type(postType)
                .build();
    }
}
