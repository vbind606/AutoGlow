package com.autoglow.backend.service;

import com.autoglow.backend.entity.User;
import com.autoglow.backend.entity.Vehicle;
import com.autoglow.backend.repository.UserRepository;
import com.autoglow.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public VehicleService(
            VehicleRepository vehicleRepository,
            UserRepository userRepository) {

        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // GET MY VEHICLES
    // =========================
    public List<Vehicle> getMyVehicles(String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return vehicleRepository.findByUser(user);
    }

    // =========================
    // GET SINGLE VEHICLE
    // =========================
    public Vehicle getVehicle(
            String email,
            Long vehicleId) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Vehicle vehicle = vehicleRepository
                .findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (!vehicle.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "Unauthorized vehicle access");
        }

        return vehicle;
    }

    // =========================
    // ADD VEHICLE
    // =========================
    public Vehicle addVehicle(
            String email,
            Vehicle vehicle) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        vehicle.setUser(user);

        return vehicleRepository.save(vehicle);
    }

    // =========================
    // UPDATE VEHICLE
    // =========================
    public Vehicle updateVehicle(
            String email,
            Long vehicleId,
            Vehicle updatedVehicle) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Vehicle vehicle = vehicleRepository
                .findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (!vehicle.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "Unauthorized vehicle access");
        }

        vehicle.setVehicleType(
                updatedVehicle.getVehicleType());

        vehicle.setBrand(
                updatedVehicle.getBrand());

        vehicle.setModel(
                updatedVehicle.getModel());

        vehicle.setRegistrationNumber(
                updatedVehicle.getRegistrationNumber());

        vehicle.setYear(
                updatedVehicle.getYear());

        vehicle.setColor(
                updatedVehicle.getColor());

        return vehicleRepository.save(vehicle);
    }

    // =========================
    // DELETE VEHICLE
    // =========================
    public void deleteVehicle(
            String email,
            Long vehicleId) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Vehicle vehicle = vehicleRepository
                .findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (!vehicle.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "Unauthorized vehicle access");
        }

        vehicleRepository.delete(vehicle);
    }

    // =========================
    // VEHICLE COUNT
    // =========================
    public long getVehicleCount(String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return vehicleRepository.countByUser(user);
    }
}