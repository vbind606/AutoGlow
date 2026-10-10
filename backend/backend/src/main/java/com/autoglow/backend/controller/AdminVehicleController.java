package com.autoglow.backend.controller;

import com.autoglow.backend.dto.AdminVehicleResponse;
import com.autoglow.backend.service.AdminVehicleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/vehicles")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminVehicleController {

    private final AdminVehicleService adminVehicleService;

    public AdminVehicleController(
            AdminVehicleService adminVehicleService) {

        this.adminVehicleService = adminVehicleService;
    }

    // =========================
    // GET ALL VEHICLES
    // =========================
    @GetMapping
    public ResponseEntity<List<AdminVehicleResponse>> getAllVehicles() {

        return ResponseEntity.ok(
                adminVehicleService.getAllVehicles()
        );
    }

    // =========================
    // GET SINGLE VEHICLE
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<AdminVehicleResponse> getVehicleById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                adminVehicleService.getVehicleById(id)
        );
    }
}