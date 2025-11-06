package com.example.courseService.service;

import com.example.courseService.model.File;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface StorageService {
    File uploadFile(MultipartFile file) throws IOException;

    byte[] downloadFile(String fileName);

    void deleteFile(String fileName);
}
