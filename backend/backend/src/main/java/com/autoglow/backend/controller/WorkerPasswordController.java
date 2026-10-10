package com.autoglow.backend.controller;

import com.autoglow.backend.dto.ChangePasswordRequest;
import com.autoglow.backend.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worker")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkerPasswordController {

    private final AuthService authService;

    public WorkerPasswordController(AuthService authService) {
        this.authService = authService;
    }

    @PutMapping("/change-password/{userId}")
    public ResponseEntity<String> changePassword(
            @PathVariable Long userId,
            @RequestBody ChangePasswordRequest request) {

        String result = authService.changePassword(
                userId,
                request.getCurrentPassword(),
                request.getNewPassword()
        );

        if ("Password updated successfully".equals(result)) {
            return ResponseEntity.ok(result);
        }

        if ("User not found".equals(result)) {
            return ResponseEntity.badRequest().body(result);
        }

        if ("Current password is incorrect".equals(result)) {
            return ResponseEntity.badRequest().body(result);
        }

        return ResponseEntity.badRequest().body(result);
    }
}