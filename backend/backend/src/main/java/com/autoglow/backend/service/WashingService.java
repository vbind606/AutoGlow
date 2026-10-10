package com.autoglow.backend.service;

import com.autoglow.backend.dto.WashingRequest;
import com.autoglow.backend.dto.WashingResponse;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.BookingStatus;
import com.autoglow.backend.entity.VehicleWashing;
import com.autoglow.backend.entity.Worker;
import com.autoglow.backend.repository.BookingRepository;
import com.autoglow.backend.repository.VehicleWashingRepository;
import com.autoglow.backend.repository.WorkerRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class WashingService {

    private final BookingRepository bookingRepository;
    private final WorkerRepository workerRepository;
    private final VehicleWashingRepository washingRepository;

    public WashingService(
            BookingRepository bookingRepository,
            WorkerRepository workerRepository,
            VehicleWashingRepository washingRepository) {

        this.bookingRepository = bookingRepository;
        this.workerRepository = workerRepository;
        this.washingRepository = washingRepository;
    }

    // =========================================================
    // GET WASHING DETAILS
    // =========================================================

    @Transactional(readOnly = true)
    public WashingResponse getWashing(
            Long bookingId,
            String workerEmail) {

        // Worker authorization check
        getWorkerBooking(bookingId, workerEmail);

        VehicleWashing washing = washingRepository
                .findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Washing record not found"));

        return toResponse(washing);
    }

    // =========================================================
    // SAVE / UPDATE WASHING
    // =========================================================

    @Transactional
    public WashingResponse saveWashing(
            Long bookingId,
            String workerEmail,
            WashingRequest request) {

        Booking booking = getWorkerBooking(bookingId, workerEmail);

        // Washing can start only after inspection
        if (booking.getStatus() != BookingStatus.INSPECTION
                && booking.getStatus() != BookingStatus.WASHING) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Washing can be started only after inspection");
        }

        // Validate wash type
        if (request.getWashType() == null
                || request.getWashType().trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Wash type is required");
        }

        // Get logged-in worker
        Worker worker = workerRepository
                .findByEmail(workerEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Worker not found"));

        // Get existing washing record or create new one
        VehicleWashing washing = washingRepository
                .findByBookingId(bookingId)
                .orElseGet(VehicleWashing::new);

        // =====================================================
        // BASIC DETAILS
        // =====================================================

        washing.setBooking(booking);
        washing.setWorker(worker);

        washing.setWashType(request.getWashType());

        // =====================================================
        // WASHING OPTIONS
        // =====================================================

        washing.setExteriorWash(request.isExteriorWash());
        washing.setInteriorCleaning(request.isInteriorCleaning());
        washing.setFoamWash(request.isFoamWash());
        washing.setPressureWash(request.isPressureWash());
        washing.setWheelCleaning(request.isWheelCleaning());
        washing.setGlassCleaning(request.isGlassCleaning());
        washing.setVacuumCleaning(request.isVacuumCleaning());
        washing.setPolishApplied(request.isPolishApplied());

        // =====================================================
        // NOTES
        // =====================================================

        washing.setWashingNotes(request.getWashingNotes());

        // =====================================================
        // START TIME
        // =====================================================

        if (washing.getStartedAt() == null) {
            washing.setStartedAt(LocalDateTime.now());
        }

        // Save washing record
        washingRepository.save(washing);

        // =====================================================
        // UPDATE BOOKING STATUS
        // =====================================================

        booking.setStatus(BookingStatus.WASHING);
        bookingRepository.saveAndFlush(booking);

        return toResponse(washing);
    }

    // =========================================================
    // WORKER BOOKING VALIDATION
    // =========================================================

    private Booking getWorkerBooking(
            Long bookingId,
            String workerEmail) {

        Worker worker = workerRepository
                .findByEmail(workerEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Worker not found"));

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found"));

        // Check whether this booking belongs to logged-in worker
        if (booking.getWorker() == null
                || !booking.getWorker()
                        .getEmail()
                        .equalsIgnoreCase(worker.getEmail())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This booking is not assigned to you");
        }

        return booking;
    }

    // =========================================================
    // ENTITY -> RESPONSE
    // =========================================================

    private WashingResponse toResponse(
            VehicleWashing washing) {

        WashingResponse response = new WashingResponse();

        response.setId(washing.getId());

        if (washing.getBooking() != null) {
            response.setBookingId(
                    washing.getBooking().getId());
        }

        response.setWashType(
                washing.getWashType());

        response.setExteriorWash(
                washing.isExteriorWash());

        response.setInteriorCleaning(
                washing.isInteriorCleaning());

        response.setFoamWash(
                washing.isFoamWash());

        response.setPressureWash(
                washing.isPressureWash());

        response.setWheelCleaning(
                washing.isWheelCleaning());

        response.setGlassCleaning(
                washing.isGlassCleaning());

        response.setVacuumCleaning(
                washing.isVacuumCleaning());

        response.setPolishApplied(
                washing.isPolishApplied());

        response.setWashingNotes(
                washing.getWashingNotes());

        response.setStartedAt(
                washing.getStartedAt());

        response.setCompletedAt(
                washing.getCompletedAt());

        return response;
    }
}