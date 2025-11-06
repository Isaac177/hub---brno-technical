package com.example.courseService.dto.request;

import lombok.Data;

@Data
public class FileUploadInitRequest {
    private String fileName;
    private long fileSize;
}
