package com.autoglow.backend.service;

import com.autoglow.backend.dto.LoginRequest;
import com.autoglow.backend.dto.LoginResponse;
import com.autoglow.backend.dto.RegisterRequest;
import com.autoglow.backend.entity.Role;
import com.autoglow.backend.entity.User;
import com.autoglow.backend.repository.UserRepository;
import com.autoglow.backend.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // =========================================
    // REGISTER
    // =========================================

    public String register(RegisterRequest request) {

        // Validate request
        if (request.getName() == null
                || request.getName().trim().isEmpty()) {
            return "Name is required";
        }

        if (request.getEmail() == null
                || request.getEmail().trim().isEmpty()) {
            return "Email is required";
        }

        if (request.getPassword() == null
                || request.getPassword().length() < 6) {
            return "Password must be at least 6 characters";
        }

        // Check duplicate email
        String email = request.getEmail().trim();

        if (userRepository.existsByEmail(email)) {
            return "Email already registered";
        }

        // Assign selected role
        Role role = Role.CUSTOMER;

        if (request.getRole() != null
                && !request.getRole().trim().isEmpty()) {

            try {
                role = Role.valueOf(
                        request.getRole().trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                return "Invalid role. Choose CUSTOMER, ADMIN or WORKER";
            }
        }

        // Create new user
        User user = new User();

        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(
                passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        // Save user
        userRepository.save(user);

        return "Registration successful";
    }

    // =========================================
    // LOGIN
    // =========================================

    public LoginResponse login(LoginRequest request) {

        // Find user by email
        User user = userRepository
                .findByEmail(request.getEmail())
                .orElse(null);

        // User not found
        if (user == null) {
            return new LoginResponse(
                    "Invalid email or password",
                    null,
                    null,
                    null,
                    null,
                    null);
        }

        // Password check
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            return new LoginResponse(
                    "Invalid email or password",
                    null,
                    null,
                    null,
                    null,
                    null);
        }

        // Handle old user records without a role
        if (user.getRole() == null) {
            user.setRole(Role.CUSTOMER);
            userRepository.save(user);
        }

        String role = user.getRole().name();

        // Login debug information
        System.out.println("====================================");
        System.out.println("AUTO GLOW LOGIN");
        System.out.println("User ID : " + user.getId());
        System.out.println("Name    : " + user.getName());
        System.out.println("Email   : " + user.getEmail());
        System.out.println("Role    : " + role);
        System.out.println("====================================");

        // Generate JWT
        String token = jwtService.generateToken(
                user.getEmail(),
                role);

        // Return login response
        return new LoginResponse(
                "Login successful",
                token,
                role,
                user.getId(),
                user.getName(),
                user.getEmail());
    }

    // =========================================
    // CHANGE PASSWORD
    // =========================================

    public String changePassword(
            Long userId,
            String currentPassword,
            String newPassword) {

        // Find user
        User user = userRepository.findById(userId)
                .orElse(null);

        if (user == null) {
            return "User not found";
        }

        // Validate current password
        if (currentPassword == null
                || !passwordEncoder.matches(
                        currentPassword,
                        user.getPassword())) {

            return "Current password is incorrect";
        }

        // Validate new password
        if (newPassword == null
                || newPassword.trim().isEmpty()) {
            return "New password cannot be empty";
        }

        if (newPassword.length() < 6) {
            return "New password must be at least 6 characters";
        }

        // Encode new password
        user.setPassword(
                passwordEncoder.encode(newPassword));

        // Save updated password
        userRepository.save(user);

        return "Password updated successfully";
    }
}