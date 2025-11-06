package com.example.kafka.coursera.exceptions.implementation;

import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;

import com.example.kafka.coursera.exceptions.CustomException;

public class NoChangesException extends CustomException {

    public NoChangesException() {
        super(HttpStatus.BAD_REQUEST, "No changes have been made");
    }
}
