package com.autoglow.backend.controller;

import com.autoglow.backend.dto.AdminCustomerDetailsResponse;
import com.autoglow.backend.service.AdminCustomerDetailsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/customers")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminCustomerDetailsController {

    private final AdminCustomerDetailsService adminCustomerDetailsService;

    public AdminCustomerDetailsController(
            AdminCustomerDetailsService adminCustomerDetailsService) {
        this.adminCustomerDetailsService = adminCustomerDetailsService;
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<AdminCustomerDetailsResponse> getCustomerDetails(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                adminCustomerDetailsService.getCustomerDetails(id));
    }
}