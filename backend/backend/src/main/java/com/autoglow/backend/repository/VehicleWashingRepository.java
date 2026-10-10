package com.autoglow.backend.repository;

import com.autoglow.backend.entity.VehicleWashing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VehicleWashingRepository
        extends JpaRepository<VehicleWashing, Long> {

    Optional<VehicleWashing> findByBookingId(Long bookingId);
}