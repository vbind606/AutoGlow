package com.autoglow.backend.controller;

import com.autoglow.backend.entity.Vehicle;
import com.autoglow.backend.service.VehicleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/vehicles")
@CrossOrigin(origins = "http://localhost:5173")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    // =========================
    // GET MY VEHICLES
    // =========================
    @GetMapping
    public ResponseEntity<List<Vehicle>> getMyVehicles(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                vehicleService.getMyVehicles(email));
    }

    // =========================
    // GET SINGLE VEHICLE
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicle(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                vehicleService.getVehicle(email, id));
    }

    // =========================
    // ADD VEHICLE
    // =========================
    @PostMapping
    public ResponseEntity<Vehicle> addVehicle(
            @RequestBody Vehicle vehicle,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                vehicleService.addVehicle(email, vehicle));
    }

    // =========================
    // UPDATE VEHICLE
    // =========================
    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(
            @PathVariable Long id,
            @RequestBody Vehicle vehicle,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                vehicleService.updateVehicle(
                        email,
                        id,
                        vehicle));
    }

    // =========================
    // DELETE VEHICLE
    // =========================
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVehicle(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        vehicleService.deleteVehicle(email, id);

        return ResponseEntity.ok(
                "Vehicle deleted successfully");
    }

    // =========================
    // VEHICLE COUNT
    // =========================
    @GetMapping("/count")
    public ResponseEntity<Long> getVehicleCount(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                vehicleService.getVehicleCount(email));
    }
}