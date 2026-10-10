package com.autoglow.backend.controller;

import com.autoglow.backend.dto.ChangePasswordRequest;
import com.autoglow.backend.dto.ProfileUpdateRequest;
import com.autoglow.backend.entity.User;
import com.autoglow.backend.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/profile")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<User> getProfile(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                profileService.getProfile(email));
    }

    @PutMapping
    public ResponseEntity<User> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                profileService.updateProfile(email, request));
    }

    @PutMapping("/password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                profileService.changePassword(
                        email,
                        request));
    }
}