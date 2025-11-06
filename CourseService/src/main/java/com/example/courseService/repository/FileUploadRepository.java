package com.example.courseService.repository;

import com.example.courseService.model.FileUpload;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileUploadRepository extends MongoRepository<FileUpload, String> {
    List<FileUpload> findBySessionId(String sessionId);

    Optional<FileUpload> findByUploadId(String uploadId);

    List<FileUpload> findByTempKey(String tempKey);
}
