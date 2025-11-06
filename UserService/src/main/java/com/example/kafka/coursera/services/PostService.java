package com.example.kafka.coursera.services;

import com.example.kafka.coursera.DTO.PostDTO;
import com.example.kafka.coursera.FactoryDTOs.PostFactoryDTO;
import com.example.kafka.coursera.db.entities.Post;
import com.example.kafka.coursera.db.entities.User;
import com.example.kafka.coursera.db.enums.PostType;
import com.example.kafka.coursera.db.repositories.PostRepository;
import com.example.kafka.coursera.db.repositories.UserRepository;
import com.example.kafka.coursera.exceptions.implementation.ResourceNotFoundException;
import com.example.kafka.coursera.requests.PostRequest;

import lombok.RequiredArgsConstructor;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostFactoryDTO factoryDTO;
    private final StorageService azureService;

    @Cacheable(value = "posts", key = "'page_' + #page + '_size_' + #size")
    public List<PostDTO> findAllPost(int page, int size) {
        Page<Post> posts = postRepository.findAll(PageRequest.of(page, size));
        return posts
                .stream()
                .map(factoryDTO::makeFullDTO)
                .toList();
    }

    @Cacheable(value = "post", key = "#id")
    public PostDTO findById(UUID id) {
        return factoryDTO.makeFullDTO(postRepository.findByIdWithComments(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post doesn't exist")));
    }

    @CachePut(value = "post", key = "#result.id")
    @CacheEvict(value = "posts", allEntries = true)
    public PostDTO createPost(PostRequest request, MultipartFile picture) throws Exception {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Post post = factoryDTO.makePost(request);
        post.setAuthor(user);
        post.setImage(azureService.uploadFile(picture));
        post = postRepository.save(post);
        return factoryDTO.makeFullDTO(post);
    }

    @CachePut(value = "post", key = "#id")
    @CacheEvict(value = "posts", allEntries = true)
    public PostDTO updatePost(PostRequest request, MultipartFile picture, UUID id) throws Exception {
        Post post = postRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Post doesn't exist"));
        mergePostAndRequest(request, post, picture);
        post = postRepository.saveAndFlush(post);
        return factoryDTO.makeFullDTO(post);
    }

    @CacheEvict(value = "post", key = "#id")
    public void deletePost(UUID id) {
        Post post = postRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Post doesn't exist"));
        postRepository.delete(post);
    }

    private void mergePostAndRequest(PostRequest request, Post post, MultipartFile picture) throws IOException {
        post.setImage(azureService.uploadFile(picture));
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setType(PostType.valueOf(request.getType()));
    }
}
