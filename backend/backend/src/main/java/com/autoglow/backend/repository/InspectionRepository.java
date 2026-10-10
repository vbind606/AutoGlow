package com.autoglow.backend.repository;

import com.autoglow.backend.entity.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InspectionRepository extends JpaRepository<Inspection, Long> {

    Optional<Inspection> findByBookingId(Long bookingId);

    boolean existsByBookingId(Long bookingId);
}