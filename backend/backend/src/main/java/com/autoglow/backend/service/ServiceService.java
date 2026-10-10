package com.autoglow.backend.service;

import com.autoglow.backend.entity.ServiceEntity;
import com.autoglow.backend.repository.ServiceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceService {

    private final ServiceRepository serviceRepository;

    public ServiceService(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    // =========================
    // CUSTOMER
    // =========================

    public List<ServiceEntity> getActiveServices() {
        return serviceRepository.findByActiveTrue();
    }

    public List<ServiceEntity> getServicesByVehicleType(String vehicleType) {
        return serviceRepository
                .findByVehicleTypeAndActiveTrue(vehicleType);
    }

    public ServiceEntity getServiceById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
    }

    // =========================
    // ADMIN
    // =========================

    // Get all services including inactive
    public List<ServiceEntity> getAllServices() {
        return serviceRepository.findAll();
    }

    // Create service
    public ServiceEntity createService(ServiceEntity service) {
        return serviceRepository.save(service);
    }

    // Update service
    public ServiceEntity updateService(
            Long id,
            ServiceEntity updatedService) {

        ServiceEntity existingService = getServiceById(id);

        existingService.setName(updatedService.getName());
        existingService.setDescription(updatedService.getDescription());
        existingService.setPrice(updatedService.getPrice());
        existingService.setDurationMinutes(
                updatedService.getDurationMinutes());
        existingService.setVehicleType(
                updatedService.getVehicleType());
        existingService.setActive(
                updatedService.isActive());

        return serviceRepository.save(existingService);
    }

    // Delete service
    public void deleteService(Long id) {
        ServiceEntity service = getServiceById(id);

        serviceRepository.delete(service);
    }

    // Activate / Deactivate service
    public ServiceEntity toggleService(Long id) {

        ServiceEntity service = getServiceById(id);

        service.setActive(!service.isActive());

        return serviceRepository.save(service);
    }
}