package com.example.courseService.dto;

import lombok.Data;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class ChunkUploadRequest {
    @NotNull(message = "Chunk index is required")
    @Min(value = 0, message = "Chunk index must be non-negative")
    private Integer chunkIndex;
    
    @NotBlank(message = "Upload token is required")
    private String uploadToken;
}
