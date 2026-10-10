package com.autoglow.backend.controller;

import com.autoglow.backend.dto.AdminPackageResponse;
import com.autoglow.backend.entity.ServicePackage;
import com.autoglow.backend.service.ServicePackageService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
@CrossOrigin(origins = "http://localhost:5173")
public class ServicePackageController {

        private final ServicePackageService packageService;

        public ServicePackageController(
                        ServicePackageService packageService) {

                this.packageService = packageService;
        }

        // =====================================================
        // CUSTOMER - ACTIVE PACKAGES
        // =====================================================

        @GetMapping
        public ResponseEntity<List<ServicePackage>> getActivePackages() {

                return ResponseEntity.ok(
                                packageService.getActivePackages());
        }

        // =====================================================
        // CUSTOMER - PACKAGES BY VEHICLE TYPE
        // =====================================================

        @GetMapping("/vehicle/{vehicleType}")
        public ResponseEntity<List<ServicePackage>> getPackagesByVehicleType(
                        @PathVariable String vehicleType) {

                return ResponseEntity.ok(
                                packageService
                                                .getPackagesByVehicleType(vehicleType));
        }

        // =====================================================
        // ADMIN - GET ALL PACKAGES
        // =====================================================

        @GetMapping("/admin/all")
        public ResponseEntity<List<AdminPackageResponse>> getAllPackages() {

                return ResponseEntity.ok(
                                packageService.getAllPackages());
        }

        // =====================================================
        // ADMIN - CREATE PACKAGE
        // =====================================================

        @PostMapping("/admin")
        public ResponseEntity<AdminPackageResponse> createPackage(
                        @RequestBody AdminPackageResponse request) {

                return ResponseEntity.ok(
                                packageService.createPackage(
                                                request.getName(),
                                                request.getDescription(),
                                                request.getPrice(),
                                                request.getDurationMinutes(),
                                                request.getVehicleType(),
                                                request.getServiceId(),
                                                request.isActive()));
        }

        // =====================================================
        // ADMIN - UPDATE PACKAGE
        // =====================================================

        @PutMapping("/admin/{id}")
        public ResponseEntity<AdminPackageResponse> updatePackage(
                        @PathVariable Long id,
                        @RequestBody AdminPackageResponse request) {

                return ResponseEntity.ok(
                                packageService.updatePackage(
                                                id,
                                                request.getName(),
                                                request.getDescription(),
                                                request.getPrice(),
                                                request.getDurationMinutes(),
                                                request.getVehicleType(),
                                                request.getServiceId(),
                                                request.isActive()));
        }

        // =====================================================
        // ADMIN - DELETE PACKAGE
        // =====================================================

        @DeleteMapping("/admin/{id}")
        public ResponseEntity<String> deletePackage(
                        @PathVariable Long id) {

                packageService.deletePackage(id);

                return ResponseEntity.ok(
                                "Package deleted successfully");
        }

        // =====================================================
        // ADMIN - TOGGLE PACKAGE
        // =====================================================

        @PatchMapping("/admin/{id}/toggle")
        public ResponseEntity<AdminPackageResponse> togglePackage(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                packageService.togglePackage(id));
        }
}