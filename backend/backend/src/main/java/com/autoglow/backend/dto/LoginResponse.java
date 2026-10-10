package com.autoglow.backend.dto;

public class LoginResponse {

    private String message;
    private String token;
    private String role;

    // User ID
    private Long id;

    // User Name
    private String name;

    // User Email
    private String email;

    public LoginResponse() {
    }

    public LoginResponse(
            String message,
            String token,
            String role,
            Long id,
            String name,
            String email) {

        this.message = message;
        this.token = token;
        this.role = role;
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
