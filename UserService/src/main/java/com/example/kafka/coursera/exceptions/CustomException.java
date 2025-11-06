package com.example.kafka.coursera.exceptions;

import org.springframework.http.HttpStatus;

public abstract class CustomException extends RuntimeException {
    private final HttpStatus status;
    private final String message;

    public CustomException(HttpStatus status, String message) {
        super(message);
        this.status = status;
        this.message = message;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}
