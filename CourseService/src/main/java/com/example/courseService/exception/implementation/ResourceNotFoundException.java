package com.example.courseService.exception.implementation;

import org.springframework.http.HttpStatus;

import com.example.courseService.exception.CustomException;

public class ResourceNotFoundException extends CustomException {

    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
