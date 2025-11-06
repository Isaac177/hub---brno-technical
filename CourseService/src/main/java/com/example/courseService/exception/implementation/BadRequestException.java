package com.example.courseService.exception.implementation;

import org.springframework.http.HttpStatus;

import com.example.courseService.exception.CustomException;

public class BadRequestException extends CustomException {

    public BadRequestException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
