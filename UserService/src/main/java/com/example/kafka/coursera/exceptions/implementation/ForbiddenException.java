package com.example.kafka.coursera.exceptions.implementation;

import org.springframework.http.HttpStatus;

import com.example.kafka.coursera.exceptions.CustomException;

public class ForbiddenException extends CustomException {

    public ForbiddenException(String message) {
        super(HttpStatus.FORBIDDEN, message);
    }
}
