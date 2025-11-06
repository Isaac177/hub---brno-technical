package com.example.courseService.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.context.request.WebRequest;
import org.springframework.http.HttpStatus;

import com.example.courseService.dto.response.ErrorResponse;
import com.example.courseService.exception.CustomException;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(CustomException.class)
        public ResponseEntity<ErrorResponse> handleCustomException(CustomException ex, WebRequest request) {
                ErrorResponse errorResponse = new ErrorResponse(
                                LocalDateTime.now(),
                                ex.getStatus().value(),
                                ex.getStatus().getReasonPhrase(),
                                ex.getMessage(),
                                request.getDescription(false).replace("uri=", ""));
                return new ResponseEntity<>(errorResponse, ex.getStatus());
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex,
                        WebRequest request) {
                String errorMessages = ex.getBindingResult()
                                .getAllErrors()
                                .stream()
                                .map(error -> error.getDefaultMessage())
                                .collect(Collectors.joining(", ")); // Join messages with comma and space

                ErrorResponse errorResponse = new ErrorResponse(
                                LocalDateTime.now(),
                                HttpStatus.BAD_REQUEST.value(),
                                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                                errorMessages, // Single string for message
                                request.getDescription(false).replace("uri=", ""));

                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

}
