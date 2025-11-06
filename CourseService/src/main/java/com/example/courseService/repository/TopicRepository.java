package com.example.courseService.repository;

import com.example.courseService.model.Topic;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TopicRepository extends MongoRepository<Topic, UUID> {
    List<Topic> findByModuleId(UUID moduleId);
}
