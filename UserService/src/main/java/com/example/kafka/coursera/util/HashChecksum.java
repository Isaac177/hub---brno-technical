package com.example.kafka.coursera.util;

import java.io.IOException;
import java.security.MessageDigest;
import org.apache.commons.codec.binary.Hex;
import org.springframework.web.multipart.MultipartFile;

public class HashChecksum {

    public static String calculateFileChecksum(MultipartFile file) throws IOException {
        MessageDigest digest;
        try {
            digest = MessageDigest.getInstance("SHA-256");
        } catch (Exception e) {
            throw new RuntimeException("Error on creating hash", e);
        }

        byte[] fileBytes = file.getBytes();
        byte[] checksumBytes = digest.digest(fileBytes);

        return Hex.encodeHexString(checksumBytes);
    }
}