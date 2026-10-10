package com.autoglow.backend.controller;

import com.autoglow.backend.entity.ServiceEntity;
import com.autoglow.backend.service.ServiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "http://localhost:5173")
public class ServiceController {

        private final ServiceService serviceService;

        public ServiceController(ServiceService serviceService) {
                this.serviceService = serviceService;
        }

        // =========================
        // CUSTOMER
        // =========================

        // Get all active services
        @GetMapping
        public ResponseEntity<List<ServiceEntity>> getActiveServices() {
                return ResponseEntity.ok(
                                serviceService.getActiveServices());
        }

        // Get services by vehicle type
        // Example: /api/services/vehicle/CAR
        @GetMapping("/vehicle/{vehicleType}")
        public ResponseEntity<List<ServiceEntity>> getServicesByVehicleType(
                        @PathVariable String vehicleType) {

                return ResponseEntity.ok(
                                serviceService.getServicesByVehicleType(vehicleType));
        }

        // Get service by ID
        @GetMapping("/{id}")
        public ResponseEntity<ServiceEntity> getServiceById(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                serviceService.getServiceById(id));
        }

        // =========================
        // ADMIN
        // =========================

        // Get all services including inactive
        @GetMapping("/admin/all")
        public ResponseEntity<List<ServiceEntity>> getAllServices() {
                return ResponseEntity.ok(
                                serviceService.getAllServices());
        }

        // Create service
        @PostMapping("/admin")
        public ResponseEntity<ServiceEntity> createService(
                        @RequestBody ServiceEntity service) {

                return ResponseEntity.ok(
                                serviceService.createService(service));
        }

        // Update service
        @PutMapping("/admin/{id}")
        public ResponseEntity<ServiceEntity> updateService(
                        @PathVariable Long id,
                        @RequestBody ServiceEntity service) {

                return ResponseEntity.ok(
                                serviceService.updateService(id, service));
        }

        // Delete service
        @DeleteMapping("/admin/{id}")
        public ResponseEntity<String> deleteService(
                        @PathVariable Long id) {

                serviceService.deleteService(id);

                return ResponseEntity.ok(
                                "Service deleted successfully");
        }

        // Activate / Deactivate service
        @PatchMapping("/admin/{id}/toggle")
        public ResponseEntity<ServiceEntity> toggleService(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                serviceService.toggleService(id));
        }
}