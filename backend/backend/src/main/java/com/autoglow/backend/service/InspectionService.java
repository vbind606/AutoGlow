package com.autoglow.backend.service;

import com.autoglow.backend.dto.InspectionRequest;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.Inspection;
import com.autoglow.backend.entity.Worker;
import com.autoglow.backend.repository.BookingRepository;
import com.autoglow.backend.repository.InspectionRepository;
import com.autoglow.backend.repository.WorkerRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class InspectionService {

    private final InspectionRepository inspectionRepository;
    private final BookingRepository bookingRepository;
    private final WorkerRepository workerRepository;

    public InspectionService(
            InspectionRepository inspectionRepository,
            BookingRepository bookingRepository,
            WorkerRepository workerRepository) {

        this.inspectionRepository = inspectionRepository;
        this.bookingRepository = bookingRepository;
        this.workerRepository = workerRepository;
    }

    @Transactional
    public Inspection saveInspection(
            Long bookingId,
            InspectionRequest request,
            String workerEmail) {

        Worker worker = workerRepository
                .findByEmail(workerEmail)
                .orElseThrow(() -> new RuntimeException("Worker not found."));

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        // Make sure this booking belongs to logged-in worker
        if (booking.getWorker() == null ||
                !booking.getWorker().getId().equals(worker.getId())) {

            throw new AccessDeniedException(
                    "This booking is not assigned to you.");
        }

        // Inspection should start from RECEIVED
        if (booking.getStatus() != null &&
                booking.getStatus() != com.autoglow.backend.entity.BookingStatus.RECEIVED &&
                booking.getStatus() != com.autoglow.backend.entity.BookingStatus.INSPECTION) {

            throw new IllegalStateException(
                    "Inspection can only be started after vehicle is received.");
        }

        Inspection inspection = inspectionRepository
                .findByBookingId(bookingId)
                .orElseGet(Inspection::new);

        inspection.setBookingId(bookingId);
        inspection.setExteriorCondition(request.getExteriorCondition());
        inspection.setInteriorCondition(request.getInteriorCondition());
        inspection.setTyreCondition(request.getTyreCondition());
        inspection.setEngineCondition(request.getEngineCondition());
        inspection.setDamageFound(request.getDamageFound());
        inspection.setInspectionNotes(request.getInspectionNotes());
        inspection.setInspectedBy(worker.getEmail());
        inspection.setInspectionDate(LocalDateTime.now());

        Inspection savedInspection = inspectionRepository.save(inspection);

        // After inspection is saved, update booking status
        booking.setStatus(
                com.autoglow.backend.entity.BookingStatus.INSPECTION);

        bookingRepository.save(booking);

        return savedInspection;
    }

    public Inspection getInspection(
            Long bookingId,
            String workerEmail) {

        Worker worker = workerRepository
                .findByEmail(workerEmail)
                .orElseThrow(() -> new RuntimeException("Worker not found."));

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        if (booking.getWorker() == null ||
                !booking.getWorker().getId().equals(worker.getId())) {

            throw new AccessDeniedException(
                    "This booking is not assigned to you.");
        }

        return inspectionRepository
                .findByBookingId(bookingId)
                .orElse(null);
    }
}