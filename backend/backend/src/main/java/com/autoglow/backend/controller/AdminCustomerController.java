package com.autoglow.backend.controller;

import com.autoglow.backend.dto.AdminCustomerResponse;
import com.autoglow.backend.service.AdminCustomerService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/customers")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    public AdminCustomerController(
            AdminCustomerService adminCustomerService) {

        this.adminCustomerService = adminCustomerService;
    }

    @GetMapping
    public ResponseEntity<List<AdminCustomerResponse>> getAllCustomers() {

        return ResponseEntity.ok(
                adminCustomerService.getAllCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminCustomerResponse> getCustomerById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                adminCustomerService.getCustomerById(id));
    }
}