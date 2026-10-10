package com.autoglow.backend.repository;

import com.autoglow.backend.entity.ServicePackage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServicePackageRepository
                extends JpaRepository<ServicePackage, Long> {

        List<ServicePackage> findByActiveTrue();

        List<ServicePackage> findByVehicleTypeAndActiveTrue(String vehicleType);

        List<ServicePackage> findByServiceId(Long serviceId);
}