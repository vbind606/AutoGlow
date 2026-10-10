package com.autoglow.backend.repository;

import com.autoglow.backend.entity.AiVehicleInspection;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AiVehicleInspectionRepository
        extends JpaRepository<AiVehicleInspection, Long> {

    // Find inspection by booking
    Optional<AiVehicleInspection> findByBooking(Booking booking);

    // Find inspection directly using booking ID
    Optional<AiVehicleInspection> findByBookingId(Long bookingId);

    // Find inspections performed by a worker
    List<AiVehicleInspection> findByWorkerOrderByCreatedAtDesc(Worker worker);

    // Find inspections by worker and status
    List<AiVehicleInspection> findByWorkerAndInspectionStatusOrderByCreatedAtDesc(
            Worker worker,
            String inspectionStatus);

    // Check whether inspection already exists for booking
    boolean existsByBooking(Booking booking);

    // Check using booking ID
    boolean existsByBookingId(Long bookingId);
}