package com.autoglow.backend.controller;

import com.autoglow.backend.dto.ServiceProgressRequest;
import com.autoglow.backend.dto.ServiceProgressResponse;
import com.autoglow.backend.service.ServiceProgressService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worker/service-progress")
public class ServiceProgressController {

    private final ServiceProgressService service;

    public ServiceProgressController(
            ServiceProgressService service) {

        this.service = service;
    }

    // =====================================================
    // GET SERVICE PROGRESS
    // =====================================================

    @GetMapping("/{bookingId}")
    public ResponseEntity<ServiceProgressResponse> getProgress(
            @PathVariable Long bookingId,
            Authentication authentication) {

        return ResponseEntity.ok(
                service.getProgress(
                        bookingId,
                        authentication.getName()));
    }

    // =====================================================
    // SAVE SERVICE PROGRESS
    // =====================================================

    @PutMapping("/{bookingId}")
    public ResponseEntity<ServiceProgressResponse> saveProgress(
            @PathVariable Long bookingId,
            @RequestBody ServiceProgressRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                service.saveProgress(
                        bookingId,
                        authentication.getName(),
                        request));
    }
}