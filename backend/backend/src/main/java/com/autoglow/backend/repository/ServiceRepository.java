package com.autoglow.backend.repository;

import com.autoglow.backend.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {

    List<ServiceEntity> findByActiveTrue();

    List<ServiceEntity> findByVehicleTypeAndActiveTrue(String vehicleType);
}