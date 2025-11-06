package com.example.kafka.coursera.exceptions.implementation;

import org.springframework.http.HttpStatus;

import com.example.kafka.coursera.exceptions.CustomException;

public class BadRequestException extends CustomException {

    public BadRequestException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
