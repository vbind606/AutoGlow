package com.autoglow.backend.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class AIInspectionExceptionHandler {

    private static final Logger logger =
            LoggerFactory.getLogger(AIInspectionExceptionHandler.class);

    // Illegal Argument Exception
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(
            IllegalArgumentException ex) {

        logger.warn("Illegal argument exception: {}", ex.getMessage(), ex);

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage());
    }

    // Runtime Exception
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex) {

        logger.error("Runtime exception occurred", ex);

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage());
    }

    // General Exception
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(
            Exception ex) {

        logger.error("Unhandled exception while processing request", ex);

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Something went wrong while processing the request.");
    }

    // Build Error Response
    private ResponseEntity<Map<String, Object>> buildResponse(
            HttpStatus status,
            String message) {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("success", false);
        response.put("status", status.value());
        response.put("error", status.getReasonPhrase());
        response.put(
                "message",
                message != null ? message : "Unknown error.");
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(status)
                .body(response);
    }
}