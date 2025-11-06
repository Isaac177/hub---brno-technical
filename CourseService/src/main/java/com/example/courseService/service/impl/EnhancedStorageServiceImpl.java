package com.example.courseService.service.impl;

import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import com.example.courseService.model.File;
import com.example.courseService.model.FileType;
import com.example.courseService.model.FileUpload;
import com.example.courseService.model.UploadStatus;
import com.example.courseService.model.Course;
import com.example.courseService.repository.FileUploadRepository;
import com.example.courseService.repository.CourseRepository;
import com.example.courseService.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@Primary
@Slf4j
@RequiredArgsConstructor
public class EnhancedStorageServiceImpl implements StorageService {

    @Value("${application.bucket.name}")
    private String bucketName;

    @Value("${application.bucket.temp-prefix}")
    private String tempPrefix;

    private final AmazonS3 s3Client;
    private final FileUploadRepository fileUploadRepository;
    private final CourseRepository courseRepository;

    public FileUpload initiateMultipartUpload(MultipartFile file, String sessionId, FileType fileType) {
        return initiateMultipartUpload(file, sessionId, fileType, null, null, null);
    }

    public FileUpload initiateMultipartUpload(MultipartFile file, String sessionId, FileType fileType,
            String courseId, Integer sectionIndex, Integer topicIndex) {
        String tempKey = tempPrefix + "/" + sessionId + "/" + UUID.randomUUID().toString();

        InitiateMultipartUploadRequest initRequest = new InitiateMultipartUploadRequest(bucketName, tempKey);
        InitiateMultipartUploadResult initResult = s3Client.initiateMultipartUpload(initRequest);
        String s3UploadId = initResult.getUploadId();

        log.info("Initiated multipart upload - Key: {}, UploadId: {}, CourseId: {}",
                tempKey, s3UploadId, courseId);

        String oldVideoUrl = null;
        if (courseId != null && sectionIndex != null && topicIndex != null) {
            try {
                Course course = courseRepository.findById(UUID.fromString(courseId))
                        .orElse(null);
                if (course != null &&
                        course.getSyllabus() != null &&
                        sectionIndex < course.getSyllabus().size() &&
                        course.getSyllabus().get(sectionIndex).getTopics() != null &&
                        topicIndex < course.getSyllabus().get(sectionIndex).getTopics().size()) {

                    oldVideoUrl = course.getSyllabus().get(sectionIndex).getTopics().get(topicIndex).getVideoUrl();
                    log.info("Found existing video URL for replacement: {}", oldVideoUrl);
                }
            } catch (Exception e) {
                log.warn("Failed to get existing video URL: {}", e.getMessage());
            }
        }

        FileUpload fileUpload = FileUpload.builder()
                .id(s3UploadId)
                .sessionId(sessionId)
                .tempKey(tempKey)
                .uploadId(s3UploadId)
                .type(fileType)
                .status(UploadStatus.INITIALIZED)
                .originalFileName(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .fileSize(file.getSize())
                .totalChunks((int) Math.ceil(file.getSize() / (10.0 * 1024 * 1024)))
                .uploadedChunks(0)
                .partETags(new ArrayList<>())
                .courseId(courseId)
                .sectionIndex(sectionIndex)
                .topicIndex(topicIndex)
                .oldVideoUrl(oldVideoUrl)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        return fileUploadRepository.save(fileUpload);
    }

    public String generatePresignedUrl(String uploadId, String key, int partNumber) {
        try {
            String fullKey = key.startsWith(tempPrefix) ? key : tempPrefix + "/" + key;

            GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(bucketName, fullKey)
                    .withMethod(HttpMethod.PUT)
                    .withExpiration(Date.from(Instant.now().plus(1, ChronoUnit.HOURS)));

            request.addRequestParameter("uploadId", uploadId);
            request.addRequestParameter("partNumber", String.valueOf(partNumber));

            return s3Client.generatePresignedUrl(request).toString();
        } catch (Exception e) {
            log.error("Failed to generate presigned URL", e);
            throw new RuntimeException("Failed to generate upload URL", e);
        }
    }

    public void completeMultipartUpload(FileUpload fileUpload) {
        if (fileUpload.getPartETags() == null || fileUpload.getPartETags().isEmpty()) {
            String errorMsg = "No parts found for upload: " + fileUpload.getUploadId();
            log.error(errorMsg);
            fileUpload.setStatus(UploadStatus.FAILED);
            fileUpload.setUpdatedAt(new Date());
            fileUploadRepository.save(fileUpload);
            throw new RuntimeException(errorMsg);
        }

        List<PartETag> partETags = new ArrayList<>();
        for (int i = 0; i < fileUpload.getPartETags().size(); i++) {
            String eTag = fileUpload.getPartETags().get(i);
            partETags.add(new PartETag(i + 1, eTag));
        }

        CompleteMultipartUploadRequest completeRequest = new CompleteMultipartUploadRequest(
                bucketName,
                fileUpload.getTempKey(),
                fileUpload.getUploadId(),
                partETags);

        try {
            log.info("Completing multipart upload: uploadId={}, key={}, parts={}",
                    fileUpload.getUploadId(),
                    fileUpload.getTempKey(),
                    partETags.size());

            CompleteMultipartUploadResult result = s3Client.completeMultipartUpload(completeRequest);

            fileUpload.setStatus(UploadStatus.COMPLETED);
            fileUpload.setUpdatedAt(new Date());
            fileUploadRepository.save(fileUpload);

            log.info("Successfully completed multipart upload: uploadId={}, key={}",
                    fileUpload.getUploadId(),
                    result.getKey());
        } catch (Exception e) {
            String errorMsg = String.format("Failed to complete multipart upload: uploadId=%s, error=%s",
                    fileUpload.getUploadId(),
                    e.getMessage());
            log.error(errorMsg, e);

            fileUpload.setStatus(UploadStatus.FAILED);
            fileUpload.setUpdatedAt(new Date());
            fileUploadRepository.save(fileUpload);

            throw new RuntimeException(errorMsg, e);
        }
    }

    public String moveToFinalLocation(FileUpload fileUpload) {
        // For course videos, keep them in temp directory to match create flow
        if (fileUpload.isCourseUpdate() && fileUpload.getType() == FileType.VIDEO) {
            log.info("Keeping course video in temp location: {}", fileUpload.getTempKey());

            fileUpload.setFinalKey(fileUpload.getTempKey());
            fileUpload.setStatus(UploadStatus.COMPLETED);
            fileUpload.setUpdatedAt(new Date());
            fileUploadRepository.save(fileUpload);

            return fileUpload.getTempKey();
        }

        // For other files, move to final location
        String finalKey = "files/" + UUID.randomUUID().toString();

        try {
            log.info("Moving file to final location: {} -> {}", fileUpload.getTempKey(), finalKey);

            CopyObjectRequest copyRequest = new CopyObjectRequest(
                    bucketName, fileUpload.getTempKey(),
                    bucketName, finalKey);
            s3Client.copyObject(copyRequest);

            s3Client.deleteObject(bucketName, fileUpload.getTempKey());

            fileUpload.setFinalKey(finalKey);
            fileUpload.setStatus(UploadStatus.COMPLETED);
            fileUpload.setUpdatedAt(new Date());
            fileUploadRepository.save(fileUpload);

            log.info("Successfully moved file to final location: {}", finalKey);
            return finalKey;
        } catch (Exception e) {
            log.error("Failed to move file to final location", e);
            fileUpload.setStatus(UploadStatus.FAILED);
            fileUpload.setUpdatedAt(new Date());
            fileUploadRepository.save(fileUpload);
            throw new RuntimeException("Failed to move file to final location", e);
        }
    }

    public void updateCourseVideo(UUID courseId, Integer sectionIndex, Integer topicIndex, String newVideoKey) {
        try {
            log.info("Updating course video: courseId={}, sectionIndex={}, topicIndex={}, newVideoKey={}",
                    courseId, sectionIndex, topicIndex, newVideoKey);

            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

            if (course.getSyllabus() == null ||
                    sectionIndex >= course.getSyllabus().size() ||
                    course.getSyllabus().get(sectionIndex).getTopics() == null ||
                    topicIndex >= course.getSyllabus().get(sectionIndex).getTopics().size()) {
                throw new RuntimeException("Invalid section or topic index for course: " + courseId);
            }

            String oldVideoUrl = course.getSyllabus().get(sectionIndex).getTopics().get(topicIndex).getVideoUrl();

            String newVideoUrl = s3Client.getUrl(bucketName, newVideoKey).toString();

            course.getSyllabus().get(sectionIndex).getTopics().get(topicIndex).setVideoUrl(newVideoUrl);

            courseRepository.save(course);

            log.info("Successfully updated course video URL: courseId={}, sectionIndex={}, topicIndex={}, newUrl={}",
                    courseId, sectionIndex, topicIndex, newVideoUrl);

            if (oldVideoUrl != null && !oldVideoUrl.equals(newVideoUrl)) {
                try {
                    String oldKey = extractKeyFromUrl(oldVideoUrl);
                    if (oldKey != null) {
                        s3Client.deleteObject(bucketName, oldKey);
                        log.info("Successfully deleted old video: {}", oldKey);
                    }
                } catch (Exception e) {
                    log.warn("Failed to delete old video: {}", oldVideoUrl, e);
                }
            }

        } catch (Exception e) {
            log.error("Failed to update course video: courseId={}, error={}", courseId, e.getMessage(), e);
            throw new RuntimeException("Failed to update course video", e);
        }
    }

    private String extractKeyFromUrl(String url) {
        if (url == null || url.isEmpty())
            return null;

        try {
            // Handle S3 URLs like: https://bucket.s3.region.amazonaws.com/files/key
            if (url.startsWith("http")) {
                String[] parts = url.split("/");
                if (parts.length >= 4) {
                    StringBuilder keyBuilder = new StringBuilder();
                    for (int i = 3; i < parts.length; i++) {
                        if (i > 3)
                            keyBuilder.append("/");
                        keyBuilder.append(parts[i]);
                    }
                    return keyBuilder.toString();
                }
            } else {
                return url;
            }
        } catch (Exception e) {
            log.warn("Failed to extract key from URL: {}", url, e);
        }
        return null;
    }

    public void recordPartUpload(String uploadId, int partNumber, String eTag) {
        FileUpload fileUpload = fileUploadRepository.findById(uploadId)
                .orElseThrow(() -> new RuntimeException("Upload not found: " + uploadId));

        if (eTag == null || eTag.trim().isEmpty()) {
            throw new RuntimeException("Invalid ETag provided for upload: " + uploadId);
        }

        synchronized (fileUpload) {
            List<String> partETags = fileUpload.getPartETags();
            while (partETags.size() < partNumber) {
                partETags.add(null);
            }
            partETags.set(partNumber - 1, eTag);

            fileUpload.setUploadedChunks(fileUpload.getUploadedChunks() + 1);
            fileUpload.setStatus(UploadStatus.IN_PROGRESS);
            fileUpload.setUpdatedAt(new Date());
            fileUploadRepository.save(fileUpload);

            log.info("Recorded part upload: uploadId={}, partNumber={}, eTag={}, progress={}/{}",
                    uploadId, partNumber, eTag, fileUpload.getUploadedChunks(), fileUpload.getTotalChunks());
        }
    }

    @Override
    public byte[] downloadFile(String key) {
        try {
            S3Object s3Object = s3Client.getObject(bucketName, key);
            S3ObjectInputStream inputStream = s3Object.getObjectContent();
            return IOUtils.toByteArray(inputStream);
        } catch (IOException e) {
            log.error("Error downloading file from S3", e);
            throw new RuntimeException("Failed to download file", e);
        }
    }

    @Override
    public File uploadFile(MultipartFile file) throws IOException {
        String key = tempPrefix + "/" + UUID.randomUUID().toString();
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());

        PutObjectRequest putRequest = new PutObjectRequest(bucketName, key, file.getInputStream(), metadata);
        s3Client.putObject(putRequest);

        String url = s3Client.getUrl(bucketName, key).toString();

        FileType fileType;
        String contentType = file.getContentType().toLowerCase();
        if (contentType.startsWith("image/")) {
            fileType = FileType.IMAGE;
        } else if (contentType.startsWith("video/")) {
            fileType = FileType.VIDEO;
        } else {
            fileType = FileType.DOCUMENT;
        }

        return File.builder()
                .key(key)
                .url(url)
                .name(file.getOriginalFilename())
                .type(fileType)
                .size(file.getSize())
                .build();
    }

    public void deleteFile(String key) {
        try {
            s3Client.deleteObject(bucketName, key);
            log.info("Successfully deleted file: {}", key);
        } catch (Exception e) {
            log.error("Failed to delete file from S3: {}", key, e);
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    public String getFileUrl(String key) {
        return s3Client.getUrl(bucketName, key).toString();
    }

    public void abortMultipartUpload(String uploadId, String key) {
        try {
            log.info("Aborting multipart upload: uploadId={}, key={}", uploadId, key);

            AbortMultipartUploadRequest abortRequest = new AbortMultipartUploadRequest(
                    bucketName, key, uploadId);
            s3Client.abortMultipartUpload(abortRequest);

            FileUpload fileUpload = fileUploadRepository.findById(uploadId)
                    .orElse(null);

            if (fileUpload != null) {
                fileUpload.setStatus(UploadStatus.ABORTED);
                fileUpload.setUpdatedAt(new Date());
                fileUploadRepository.save(fileUpload);
                log.info("Updated upload status to ABORTED: uploadId={}", uploadId);
            }

            try {
                s3Client.deleteObject(bucketName, key);
                log.info("Cleaned up temporary file: key={}", key);
            } catch (Exception e) {
                log.warn("Failed to clean up temporary file: key={}", key, e);
            }
        } catch (Exception e) {
            log.error("Failed to abort multipart upload: uploadId={}, key={}", uploadId, key, e);
            throw new RuntimeException("Failed to abort upload", e);
        }
    }

    public FileUpload getFileUpload(String uploadId) {
        return fileUploadRepository.findById(uploadId)
                .orElseThrow(() -> new RuntimeException("Upload not found with id: " + uploadId));
    }
}
