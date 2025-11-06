package com.example.courseService.controller;

import com.example.courseService.model.FileUpload;
import com.example.courseService.model.FileType;
import com.example.courseService.service.impl.EnhancedStorageServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/uploads")
public class FileUploadController {

    private final EnhancedStorageServiceImpl storageService;

    @PostMapping("/initiate")
    public ResponseEntity<FileUpload> initiateUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("sessionId") String sessionId,
            @RequestParam("fileType") FileType fileType,
            @RequestParam(value = "courseId", required = false) String courseId,
            @RequestParam(value = "sectionIndex", required = false) Integer sectionIndex,
            @RequestParam(value = "topicIndex", required = false) Integer topicIndex) {

        log.info("Initiating upload - sessionId: {}, fileType: {}, courseId: {}, sectionIndex: {}, topicIndex: {}",
                sessionId, fileType, courseId, sectionIndex, topicIndex);

        FileUpload upload = storageService.initiateMultipartUpload(
                file, sessionId, fileType, courseId, sectionIndex, topicIndex);

        log.info("Upload initiated successfully - uploadId: {}, tempKey: {}",
                upload.getId(), upload.getTempKey());

        return ResponseEntity.ok(upload);
    }

    @GetMapping("/presigned-url")
    public ResponseEntity<Map<String, String>> getPresignedUrl(
            @RequestParam("uploadId") String uploadId,
            @RequestParam("key") String key,
            @RequestParam("partNumber") int partNumber) {

        log.info("Generating presigned URL - uploadId: {}, key: {}, partNumber: {}",
                uploadId, key, partNumber);

        String url = storageService.generatePresignedUrl(uploadId, key, partNumber);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/parts")
    public ResponseEntity<?> recordPart(
            @RequestParam String uploadId,
            @RequestParam int partNumber,
            @RequestParam String eTag) {
        try {
            log.info("Recording part upload: uploadId={}, partNumber={}, eTag={}",
                    uploadId, partNumber, eTag);
            storageService.recordPartUpload(uploadId, partNumber, eTag);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to record part upload: uploadId={}, partNumber={}, error={}",
                    uploadId, partNumber, e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to record part upload: " + e.getMessage()));
        }
    }

    @PostMapping("/{uploadId}/complete")
    public ResponseEntity<Map<String, Object>> completeUpload(@PathVariable String uploadId) {
        try {
            log.info("Completing upload: uploadId={}", uploadId);
            FileUpload fileUpload = storageService.getFileUpload(uploadId);
            storageService.completeMultipartUpload(fileUpload);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "uploadId", uploadId,
                    "tempKey", fileUpload.getTempKey()));
        } catch (Exception e) {
            log.error("Failed to complete upload: uploadId={}, error={}", uploadId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @PostMapping("/{uploadId}/move")
    public ResponseEntity<Map<String, Object>> moveToFinal(@PathVariable String uploadId) {
        try {
            log.info("Moving to final location: uploadId={}", uploadId);
            FileUpload fileUpload = storageService.getFileUpload(uploadId);
            String finalKey = storageService.moveToFinalLocation(fileUpload);

            // If this is a course update, handle the video URL update
            if (fileUpload.getCourseId() != null &&
                    fileUpload.getSectionIndex() != null &&
                    fileUpload.getTopicIndex() != null) {

                log.info("Processing course video update: courseId={}, sectionIndex={}, topicIndex={}",
                        fileUpload.getCourseId(), fileUpload.getSectionIndex(), fileUpload.getTopicIndex());

                storageService.updateCourseVideo(
                        UUID.fromString(fileUpload.getCourseId()),
                        fileUpload.getSectionIndex(),
                        fileUpload.getTopicIndex(),
                        finalKey);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "finalKey", finalKey,
                    "uploadId", uploadId));
        } catch (Exception e) {
            log.error("Failed to move to final location: uploadId={}, error={}", uploadId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @PostMapping("/abort")
    public ResponseEntity<Map<String, Object>> abortUpload(
            @RequestParam("uploadId") String uploadId,
            @RequestParam("key") String key) {
        try {
            log.info("Aborting upload - UploadId: {}, Key: {}", uploadId, key);
            storageService.abortMultipartUpload(uploadId, key);
            log.info("Successfully aborted upload - UploadId: {}", uploadId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("Failed to abort upload - UploadId: {}, Error: {}", uploadId, e.getMessage());
            // Return 200 even on error since we want the client to proceed
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }
}