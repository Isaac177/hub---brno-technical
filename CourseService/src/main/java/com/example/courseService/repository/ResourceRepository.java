package com.example.courseService.repository;

import com.example.courseService.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.UUID;

public interface ResourceRepository extends MongoRepository<Resource, UUID> {
    List<Resource> findByTopicId(UUID id);
}
