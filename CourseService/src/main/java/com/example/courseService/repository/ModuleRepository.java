package com.example.courseService.repository;

import java.util.List;
import java.util.UUID;

import com.example.courseService.model.Module;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ModuleRepository extends MongoRepository<Module, UUID> {
    List<Module> findByCourseId(UUID id);
}
