package com.autoglow.backend.repository;

import com.autoglow.backend.entity.VehicleServiceProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VehicleServiceProgressRepository
        extends JpaRepository<VehicleServiceProgress, Long> {

    Optional<VehicleServiceProgress> findByBookingId(Long bookingId);
}