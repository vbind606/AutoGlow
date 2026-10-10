package com.autoglow.backend.controller;

import com.autoglow.backend.dto.WashingRequest;
import com.autoglow.backend.dto.WashingResponse;
import com.autoglow.backend.service.WashingService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worker/washings")
public class WashingController {

    private final WashingService washingService;

    public WashingController(WashingService washingService) {
        this.washingService = washingService;
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<WashingResponse> getWashing(
            @PathVariable Long bookingId,
            Authentication authentication) {

        String workerEmail = authentication.getName();

        return ResponseEntity.ok(
                washingService.getWashing(
                        bookingId,
                        workerEmail));
    }

    @PutMapping("/{bookingId}")
    public ResponseEntity<WashingResponse> saveWashing(
            @PathVariable Long bookingId,
            @RequestBody WashingRequest request,
            Authentication authentication) {

        String workerEmail = authentication.getName();

        return ResponseEntity.ok(
                washingService.saveWashing(
                        bookingId,
                        workerEmail,
                        request));
    }
}