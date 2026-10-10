package com.autoglow.backend.service;

import com.autoglow.backend.dto.AdminPackageResponse;
import com.autoglow.backend.entity.ServiceEntity;
import com.autoglow.backend.entity.ServicePackage;
import com.autoglow.backend.repository.ServicePackageRepository;
import com.autoglow.backend.repository.ServiceRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServicePackageService {

    private final ServicePackageRepository packageRepository;
    private final ServiceRepository serviceRepository;

    public ServicePackageService(
            ServicePackageRepository packageRepository,
            ServiceRepository serviceRepository) {

        this.packageRepository = packageRepository;
        this.serviceRepository = serviceRepository;
    }

    // =====================================================
    // CUSTOMER - GET ACTIVE PACKAGES
    // =====================================================

    public List<ServicePackage> getActivePackages() {

        return packageRepository.findByActiveTrue();
    }

    // =====================================================
    // CUSTOMER - GET PACKAGES BY VEHICLE TYPE
    // =====================================================

    public List<ServicePackage> getPackagesByVehicleType(
            String vehicleType) {

        return packageRepository
                .findByVehicleTypeAndActiveTrue(vehicleType);
    }

    // =====================================================
    // ADMIN - GET ALL PACKAGES
    // =====================================================

    public List<AdminPackageResponse> getAllPackages() {

        return packageRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =====================================================
    // ADMIN - CREATE PACKAGE
    // =====================================================

    public AdminPackageResponse createPackage(
            String name,
            String description,
            Double price,
            Integer durationMinutes,
            String vehicleType,
            Long serviceId,
            boolean active) {

        ServiceEntity service = null;

        if (serviceId != null) {

            service = serviceRepository.findById(serviceId)
                    .orElseThrow(() -> new RuntimeException("Service not found"));
        }

        ServicePackage servicePackage = new ServicePackage();

        servicePackage.setName(name);
        servicePackage.setDescription(description);
        servicePackage.setPrice(price);
        servicePackage.setDurationMinutes(durationMinutes);
        servicePackage.setVehicleType(vehicleType);
        servicePackage.setActive(active);
        servicePackage.setService(service);

        ServicePackage saved = packageRepository.save(servicePackage);

        return convertToResponse(saved);
    }

    // =====================================================
    // ADMIN - UPDATE PACKAGE
    // =====================================================

    public AdminPackageResponse updatePackage(
            Long id,
            String name,
            String description,
            Double price,
            Integer durationMinutes,
            String vehicleType,
            Long serviceId,
            boolean active) {

        ServicePackage existingPackage = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Package not found"));

        ServiceEntity service = null;

        if (serviceId != null) {

            service = serviceRepository.findById(serviceId)
                    .orElseThrow(() -> new RuntimeException(
                            "Service not found"));
        }

        existingPackage.setName(name);
        existingPackage.setDescription(description);
        existingPackage.setPrice(price);
        existingPackage.setDurationMinutes(durationMinutes);
        existingPackage.setVehicleType(vehicleType);
        existingPackage.setActive(active);
        existingPackage.setService(service);

        ServicePackage saved = packageRepository.save(existingPackage);

        return convertToResponse(saved);
    }

    // =====================================================
    // ADMIN - DELETE PACKAGE
    // =====================================================

    public void deletePackage(Long id) {

        ServicePackage servicePackage = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Package not found"));

        packageRepository.delete(servicePackage);
    }

    // =====================================================
    // ADMIN - TOGGLE ACTIVE / INACTIVE
    // =====================================================

    public AdminPackageResponse togglePackage(Long id) {

        ServicePackage servicePackage = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Package not found"));

        servicePackage.setActive(
                !servicePackage.isActive());

        ServicePackage saved = packageRepository.save(servicePackage);

        return convertToResponse(saved);
    }

    // =====================================================
    // CONVERT ENTITY → DTO
    // =====================================================

    private AdminPackageResponse convertToResponse(
            ServicePackage packageEntity) {

        Long serviceId = null;
        String serviceName = null;

        if (packageEntity.getService() != null) {

            serviceId = packageEntity.getService().getId();

            serviceName = packageEntity.getService().getName();
        }

        return new AdminPackageResponse(
                packageEntity.getId(),
                packageEntity.getName(),
                packageEntity.getDescription(),
                packageEntity.getPrice(),
                packageEntity.getDurationMinutes(),
                packageEntity.getVehicleType(),
                packageEntity.isActive(),
                serviceId,
                serviceName);
    }
}