package com.example.kafka.coursera.services;

import com.example.kafka.coursera.DTO.CommentDTO;
import com.example.kafka.coursera.DTO.PostDTO;
import com.example.kafka.coursera.FactoryDTOs.CommentFactoryDTO;
import com.example.kafka.coursera.FactoryDTOs.PostFactoryDTO;
import com.example.kafka.coursera.db.entities.Comment;
import com.example.kafka.coursera.db.entities.Post;
import com.example.kafka.coursera.db.entities.User;
import com.example.kafka.coursera.db.repositories.CommentRepository;
import com.example.kafka.coursera.db.repositories.PostRepository;
import com.example.kafka.coursera.db.repositories.UserRepository;
import com.example.kafka.coursera.exceptions.implementation.ForbiddenException;
import com.example.kafka.coursera.exceptions.implementation.ResourceNotFoundException;
import com.example.kafka.coursera.requests.CommentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CachePut;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CacheService<PostDTO> cacheService;
    private final PostRepository postRepository;
    private final CommentRepository repository;
    private final UserRepository userRepository;
    private final CommentFactoryDTO factoryDTO;
    private final PostFactoryDTO postFactory;

    public CommentDTO sendComment(CommentRequest request) throws Exception {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Comment comment = factoryDTO.makeComment(request);
        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        comment.setPost(post);
        comment.setAuthor(user);
        comment = repository.save(comment);

        CommentDTO commentDTO = factoryDTO.makeDTO(comment, request.getPostId());
        commentDTO.setMessage("Comment created");

        post.getComments().add(comment);
        PostDTO postDTO = postFactory.makeFullDTO(post);
//        cacheService.updateCache("posts", post.getId(), post);
        cacheService.updateCache("post", post.getId(), postDTO);

        return commentDTO;
    }

    public CommentDTO updateComment(CommentRequest request, UUID commentId) throws Exception {
        Comment comment = repository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment doesnt exist"));
        User author = comment.getAuthor();

        String email = author.getEmail();
        String requestEmail = request.getEmail();

        if (!email.equals(requestEmail))
            throw new ForbiddenException("You're not allowed to edit this comment");

        mergeComment(comment, request);
        comment = repository.save(comment);

        CommentDTO commentDTO = factoryDTO.makeDTO(comment, request.getPostId());
        commentDTO.setMessage("Comment updated");
        return commentDTO;
    }

    private void mergeComment(Comment comment, CommentRequest request) {
        comment.setContent(request.getContent());
    }

    public void deleteComment(UUID id) {
        Comment comment = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment doesnt exist"));
        repository.delete(comment);
    }
}
