package com.example.kafka.coursera.exceptions.implementation;

import org.springframework.http.HttpStatus;

import com.example.kafka.coursera.exceptions.CustomException;

public class ResourceNotFoundException extends CustomException {

    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
