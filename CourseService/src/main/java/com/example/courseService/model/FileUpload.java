package com.example.courseService.model;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "file_uploads")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUpload {
    @Id
    private String id;

    private String sessionId;
    private String tempKey;
    private String finalKey;
    private String uploadId;
    private FileType type;
    private UploadStatus status;
    private Integer totalChunks;
    private Integer uploadedChunks;
    private Long fileSize;
    private String originalFileName;
    private String mimeType;
    private String checksum;
    private List<String> partETags = new ArrayList<>();

    // Course update specific fields
    private String courseId;
    private Integer sectionIndex;
    private Integer topicIndex;
    private String oldVideoUrl; // To track what video we're replacing

    // Metadata
    private Date createdAt;
    private Date updatedAt;

    public void addPartETag(String eTag) {
        this.partETags.add(eTag);
        this.uploadedChunks = partETags.size();
        this.updatedAt = new Date();
    }

    public boolean isComplete() {
        return uploadedChunks != null &&
                totalChunks != null &&
                uploadedChunks.equals(totalChunks);
    }

    public boolean isCourseUpdate() {
        return courseId != null && sectionIndex != null && topicIndex != null;
    }
}
