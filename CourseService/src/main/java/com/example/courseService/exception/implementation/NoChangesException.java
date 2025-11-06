package com.example.courseService.exception.implementation;

import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;

import com.example.courseService.exception.CustomException;

public class NoChangesException extends CustomException {

    public NoChangesException(MessageSource messageSource, Locale locale) {
        super(HttpStatus.BAD_REQUEST, messageSource.getMessage("message.nochanges", null, locale));
    }
}
