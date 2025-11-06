package com.example.kafka.coursera.services;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.amazonaws.util.IOUtils;
import com.example.kafka.coursera.db.entities.School;
import com.example.kafka.coursera.util.HashChecksum;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

@Service
@Slf4j
public class StorageService {

    @Value("${application.bucket.name}")
    private String bucketName;

    @Autowired
    private AmazonS3 s3Client;

    public com.example.kafka.coursera.db.entities.File uploadFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        File fileObj = convertMultiPartFileToFile(file);
        String checksum = HashChecksum.calculateFileChecksum(file);
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        s3Client.putObject(new PutObjectRequest(bucketName, fileName, fileObj));
        fileObj.delete();

        String fileUrl = s3Client.getUrl(bucketName, fileName).toString();

        com.example.kafka.coursera.db.entities.File result = com.example.kafka.coursera.db.entities.File.builder()
                .filename(fileName)
                .checkSum(checksum)
                .url(fileUrl)
                .build();

        return result;
    }

    public byte[] downloadFile(String fileName) {

        S3Object s3Object = s3Client.getObject(bucketName, fileName);
        S3ObjectInputStream inputStream = s3Object.getObjectContent();

        try {
            byte[] content = IOUtils.toByteArray(inputStream);
            return content;
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }

    public String deleteFile(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            log.warn("Attempted to delete file with null or empty filename");
            return "No filename provided";
        }
        try {
            s3Client.deleteObject(bucketName, fileName);
            log.info("Successfully deleted file: {} from bucket: {}", fileName, bucketName);
            return fileName + " removed ...";
        } catch (Exception e) {
            log.error("Error deleting file: {} from bucket: {}", fileName, bucketName, e);
            throw new RuntimeException("Failed to delete file: " + fileName, e);
        }
    }

    private File convertMultiPartFileToFile(MultipartFile file) {
        try {
            // Create temp file in the system's temporary directory
            File convertedFile = File.createTempFile("temp-", "-" + file.getOriginalFilename());
            try (FileOutputStream fos = new FileOutputStream(convertedFile)) {
                fos.write(file.getBytes());
            }
            return convertedFile;
        } catch (IOException e) {
            log.error("Error converting multipartFile to file", e);
            throw new RuntimeException("Failed to convert multipart file", e);
        }
    }

    public com.example.kafka.coursera.db.entities.File processUpload(
            com.example.kafka.coursera.db.entities.File existingFile, MultipartFile fileRequest,
            boolean isChecksumEqual) throws Exception {
        // Always process the upload if a file is provided, regardless of checksum
        if (fileRequest != null && !fileRequest.isEmpty()) {
            com.example.kafka.coursera.db.entities.File uploadedLogo = this.uploadFile(fileRequest);
            if (existingFile != null) {
                deleteFile(existingFile.getFilename());
            }
            return uploadedLogo;
        }
        return existingFile;
    }
}