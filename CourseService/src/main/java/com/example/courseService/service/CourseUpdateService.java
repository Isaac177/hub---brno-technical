package com.example.courseService.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.example.courseService.dto.*;
import com.example.courseService.exception.CourseNotFoundException;
import com.example.courseService.exception.MediaUploadException;
import com.example.courseService.model.Course;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.Optional;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseUpdateService {

    private final AmazonS3 s3Client;
    private final MongoTemplate mongoTemplate;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${app.upload.temp-dir}")
    private String tempUploadDir;

    private final Map<String, MediaUploadMetadata> activeUploads = new HashMap<>();

    public String initializeMediaUpload(String courseId, String mediaType, MediaUploadRequest request) {
        validateCourseExists(courseId);
        
        String uploadToken = UUID.randomUUID().toString();
        String uploadDir = createUploadDirectory(uploadToken);
        
        activeUploads.put(uploadToken, new MediaUploadMetadata(
            courseId,
            mediaType,
            request.getFileName(),
            request.getTotalChunks(),
            request.getContentType(),
            uploadDir
        ));
        
        return uploadToken;
    }

    public void handleChunkUpload(MultipartFile chunk, ChunkUploadRequest request) {
        MediaUploadMetadata metadata = activeUploads.get(request.getUploadToken());
        if (metadata == null) {
            throw new MediaUploadException("Invalid upload token");
        }

        try {
            String chunkPath = metadata.uploadDir + File.separator + request.getChunkIndex();
            try (FileOutputStream fos = new FileOutputStream(chunkPath)) {
                fos.write(chunk.getBytes());
            }
        } catch (IOException e) {
            log.error("Failed to save chunk", e);
            throw new MediaUploadException("Failed to save chunk: " + e.getMessage());
        }
    }

    public String completeMediaUpload(String uploadToken) {
        MediaUploadMetadata metadata = activeUploads.get(uploadToken);
        if (metadata == null) {
            throw new MediaUploadException("Invalid upload token");
        }

        try {
            // Get the old media URL before updating
            String oldMediaUrl = getOldMediaUrl(metadata.courseId, metadata.mediaType);
            
            // Upload new file
            File combinedFile = combineChunks(metadata);
            String s3Key = generateS3Key(metadata);
            String newMediaUrl = uploadToS3(combinedFile, s3Key, metadata.contentType);
            
            // Update the course with new media URL
            updateCourseMediaUrl(metadata.courseId, metadata.mediaType, newMediaUrl);
            
            // Delete old file from S3 if it exists
            if (oldMediaUrl != null) {
                deleteOldMediaFromS3(oldMediaUrl);
            }
            
            cleanup(metadata.uploadDir);
            activeUploads.remove(uploadToken);
            
            return newMediaUrl;
        } catch (Exception e) {
            log.error("Failed to complete upload", e);
            cleanup(metadata.uploadDir);
            activeUploads.remove(uploadToken);
            throw new MediaUploadException("Failed to complete upload: " + e.getMessage());
        }
    }

    private String getOldMediaUrl(String courseId, String mediaType) {
        Course course = mongoTemplate.findOne(
            query(where("id").is(UUID.fromString(courseId))),
            Course.class
        );
        
        if (course == null) {
            return null;
        }

        if ("thumbnail".equals(mediaType)) {
            return Optional.ofNullable(course.getThumbnail())
                .map(file -> file.getUrl())
                .orElse(null);
        } else if ("featuredImage".equals(mediaType)) {
            return Optional.ofNullable(course.getFeaturedImage())
                .map(file -> file.getUrl())
                .orElse(null);
        } else if ("video".equals(mediaType)) {
            // Handle video URL from syllabus based on current context
            // This would need more context about which module/topic is being updated
            return null;
        }
        
        return null;
    }

    private void updateCourseMediaUrl(String courseId, String mediaType, String newUrl) {
        Update update = new Update();
        
        if ("thumbnail".equals(mediaType)) {
            update.set("thumbnail.url", newUrl);
        } else if ("featuredImage".equals(mediaType)) {
            update.set("featuredImage.url", newUrl);
        }
        // Note: video URLs in syllabus would need to be handled separately
        // as they require module/topic context
        
        if (!update.getUpdateObject().isEmpty()) {
            mongoTemplate.updateFirst(
                query(where("id").is(UUID.fromString(courseId))),
                update,
                Course.class
            );
        }
    }

    private void deleteOldMediaFromS3(String oldMediaUrl) {
        try {
            String key = extractS3KeyFromUrl(oldMediaUrl);
            if (key != null) {
                s3Client.deleteObject(new DeleteObjectRequest(bucketName, key));
                log.info("Deleted old media file from S3: {}", key);
            }
        } catch (Exception e) {
            log.error("Failed to delete old media from S3: {}", oldMediaUrl, e);
            // Don't throw exception as this is cleanup operation
        }
    }

    private String extractS3KeyFromUrl(String url) {
        if (url == null) return null;
        // Remove the base S3 URL to get the key
        String baseUrl = s3Client.getUrl(bucketName, "").toString();
        return url.replace(baseUrl, "");
    }

    public void updateCourseData(String courseId, CourseUpdateRequest request) {
        validateCourseExists(courseId);
        
        Update update = new Update()
            .set("title", request.getTitle())
            .set("description", request.getDescription())
            .set("schoolId", request.getSchoolId())
            .set("category", request.getCategory())
            .set("level", request.getLevel())
            .set("price", request.getPrice())
            .set("isPublished", request.getIsPublished())
            .set("thumbnailUrl", request.getThumbnailUrl());

        mongoTemplate.updateFirst(
            query(where("id").is(UUID.fromString(courseId))),
            update,
            Course.class
        );
    }

    public void updateCourseSyllabus(String courseId, SyllabusUpdateRequest request) {
        validateCourseExists(courseId);
        
        Update update = new Update().set("syllabus", request.getModules());
        
        mongoTemplate.updateFirst(
            query(where("id").is(UUID.fromString(courseId))),
            update,
            Course.class
        );
    }

    private String createUploadDirectory(String uploadToken) {
        try {
            Path uploadDir = Path.of(tempUploadDir, uploadToken);
            Files.createDirectories(uploadDir);
            return uploadDir.toString();
        } catch (IOException e) {
            throw new MediaUploadException("Failed to create upload directory");
        }
    }

    private File combineChunks(MediaUploadMetadata metadata) throws IOException {
        File combinedFile = new File(metadata.uploadDir + File.separator + "combined");
        try (FileOutputStream fos = new FileOutputStream(combinedFile)) {
            for (int i = 0; i < metadata.totalChunks; i++) {
                Path chunkPath = Path.of(metadata.uploadDir, String.valueOf(i));
                Files.copy(chunkPath, fos);
            }
        }
        return combinedFile;
    }

    private String uploadToS3(File file, String key, String contentType) {
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(contentType);
        metadata.setContentLength(file.length());

        s3Client.putObject(new PutObjectRequest(bucketName, key, file));
        return s3Client.getUrl(bucketName, key).toString();
    }

    private String generateS3Key(MediaUploadMetadata metadata) {
        return String.format("courses/%s/%s/%s-%s",
            metadata.courseId,
            metadata.mediaType,
            UUID.randomUUID(),
            metadata.fileName
        );
    }

    private void cleanup(String directory) {
        try {
            Files.walk(Path.of(directory))
                .sorted((a, b) -> b.compareTo(a))
                .forEach(path -> {
                    try {
                        Files.delete(path);
                    } catch (IOException e) {
                        log.error("Failed to delete: " + path, e);
                    }
                });
        } catch (IOException e) {
            log.error("Failed to cleanup directory: " + directory, e);
        }
    }

    private void validateCourseExists(String courseId) {
        if (!mongoTemplate.exists(
                query(where("id").is(UUID.fromString(courseId))),
                Course.class)) {
            throw new CourseNotFoundException("Course not found: " + courseId);
        }
    }

    @Data
    private static class MediaUploadMetadata {
        private final String courseId;
        private final String mediaType;
        private final String fileName;
        private final int totalChunks;
        private final String contentType;
        private final String uploadDir;
    }
}
