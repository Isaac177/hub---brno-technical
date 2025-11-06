package com.example.courseService.service.impl;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.amazonaws.util.IOUtils;
import com.example.courseService.service.StorageService;
import com.example.courseService.utils.HashChecksum;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class StorageServiceImpl implements StorageService {

    @Value("${application.bucket.name}")
    private String bucketName;

    private final AmazonS3 s3Client;

    @Override
    public com.example.courseService.model.File uploadFile(MultipartFile file) throws IOException {

        File fileObj = convertMultiPartFileToFile(file);
        String checksum = HashChecksum.calculateFileChecksum(file);
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        s3Client.putObject(new PutObjectRequest(bucketName, fileName, fileObj));
        fileObj.delete();

        String fileUrl = s3Client.getUrl(bucketName, fileName).toString();

        return com.example.courseService.model.File.builder()
                .name(fileName)
                .checkSum(checksum)
                .url(fileUrl)
                .build();
    }

    @Override
    public byte[] downloadFile(String fileName) {

        S3Object s3Object = s3Client.getObject(bucketName, fileName);
        S3ObjectInputStream inputStream = s3Object.getObjectContent();

        try {
            return IOUtils.toByteArray(inputStream);
        } catch (IOException e) {
            log.warn(e.getMessage(), e);
        }

        return null;
    }

    @Override
    public void deleteFile(String fileName) {
        s3Client.deleteObject(bucketName, fileName);
    }

    private File convertMultiPartFileToFile(MultipartFile file) {
        File convertedFile = new File(Objects.requireNonNull(file.getOriginalFilename()));

        try (FileOutputStream fos = new FileOutputStream(convertedFile)) {
            fos.write(file.getBytes());
        } catch (IOException e) {
            log.error("Error converting multipartFile to file", e);
        }
        return convertedFile;
    }
}