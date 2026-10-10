package com.autoglow.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @GetMapping("/dashboard")
    public String dashboard(
            Authentication authentication) {

        return "Welcome Customer! Logged in as: "
                + authentication.getName();
    }
}