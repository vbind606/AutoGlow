package com.autoglow.backend.service;

import com.autoglow.backend.dto.ChangePasswordRequest;
import com.autoglow.backend.dto.ProfileUpdateRequest;
import com.autoglow.backend.entity.User;
import com.autoglow.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User getProfile(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(
            String email,
            ProfileUpdateRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null &&
                !request.getName().trim().isEmpty()) {

            user.setName(request.getName().trim());
        }

        if (request.getEmail() != null &&
                !request.getEmail().trim().isEmpty() &&
                !request.getEmail().equalsIgnoreCase(user.getEmail())) {

            if (userRepository.existsByEmail(request.getEmail().trim())) {
                throw new RuntimeException("Email already registered");
            }

            user.setEmail(request.getEmail().trim());
        }

        return userRepository.save(user);
    }

    public String changePassword(
            String email,
            ChangePasswordRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getCurrentPassword() == null ||
                request.getCurrentPassword().isEmpty()) {

            throw new RuntimeException("Current password is required");
        }

        if (request.getNewPassword() == null ||
                request.getNewPassword().length() < 6) {

            throw new RuntimeException(
                    "New password must be at least 6 characters");
        }

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {

            throw new RuntimeException(
                    "Current password is incorrect");
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);

        return "Password changed successfully";
    }
}