package com.autoglow.backend.service;

import com.autoglow.backend.dto.AdminVehicleResponse;
import com.autoglow.backend.entity.Vehicle;
import com.autoglow.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminVehicleService {

    private final VehicleRepository vehicleRepository;

    public AdminVehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    // =========================
    // GET ALL VEHICLES
    // =========================
    public List<AdminVehicleResponse> getAllVehicles() {

        List<Vehicle> vehicles = vehicleRepository.findAll();

        return vehicles.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================
    // GET SINGLE VEHICLE
    // =========================
    public AdminVehicleResponse getVehicleById(Long id) {

        Vehicle vehicle = vehicleRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        return convertToResponse(vehicle);
    }

    // =========================
    // CONVERT ENTITY → DTO
    // =========================
    private AdminVehicleResponse convertToResponse(
            Vehicle vehicle) {

        return new AdminVehicleResponse(

                vehicle.getId(),

                vehicle.getUser().getId(),

                vehicle.getUser().getName(),

                vehicle.getUser().getEmail(),

                vehicle.getVehicleType(),

                vehicle.getBrand(),

                vehicle.getModel(),

                vehicle.getRegistrationNumber(),

                vehicle.getYear(),

                vehicle.getColor());
    }
}