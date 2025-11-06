package com.example.courseService.dto;

import lombok.Data;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class MediaUploadRequest {
    @NotBlank(message = "File name is required")
    private String fileName;
    
    @NotNull(message = "Total chunks is required")
    @Min(value = 1, message = "Total chunks must be at least 1")
    private Integer totalChunks;
    
    @NotBlank(message = "Content type is required")
    private String contentType;
}
