package com.autoglow.backend.service;

import com.autoglow.backend.dto.ServiceProgressRequest;
import com.autoglow.backend.dto.ServiceProgressResponse;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.BookingStatus;
import com.autoglow.backend.entity.VehicleServiceProgress;
import com.autoglow.backend.entity.Worker;
import com.autoglow.backend.repository.BookingRepository;
import com.autoglow.backend.repository.VehicleServiceProgressRepository;
import com.autoglow.backend.repository.WorkerRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class ServiceProgressService {

    private final BookingRepository bookingRepository;
    private final WorkerRepository workerRepository;
    private final VehicleServiceProgressRepository progressRepository;

    public ServiceProgressService(
            BookingRepository bookingRepository,
            WorkerRepository workerRepository,
            VehicleServiceProgressRepository progressRepository) {

        this.bookingRepository = bookingRepository;
        this.workerRepository = workerRepository;
        this.progressRepository = progressRepository;
    }

    // =========================================================
    // GET SERVICE PROGRESS
    // =========================================================

    @Transactional(readOnly = true)
    public ServiceProgressResponse getProgress(
            Long bookingId,
            String workerEmail) {

        Booking booking = getWorkerBooking(bookingId, workerEmail);

        VehicleServiceProgress progress = progressRepository.findByBookingId(bookingId)
                .orElse(null);

        if (progress == null) {
            return createEmptyResponse(booking);
        }

        return mapToResponse(progress, booking);
    }

    // =========================================================
    // SAVE SERVICE PROGRESS
    // =========================================================

    @Transactional
    public ServiceProgressResponse saveProgress(
            Long bookingId,
            String workerEmail,
            ServiceProgressRequest request) {

        Booking booking = getWorkerBooking(bookingId, workerEmail);

        BookingStatus currentStatus = booking.getStatus();

        /*
         * Service Progress page is used for:
         *
         * WASHING
         * DRYING
         * QUALITY_CHECK
         * COMPLETED
         * DELIVERED
         */

        if (currentStatus != BookingStatus.WASHING
                && currentStatus != BookingStatus.DRYING
                && currentStatus != BookingStatus.QUALITY_CHECK
                && currentStatus != BookingStatus.COMPLETED
                && currentStatus != BookingStatus.DELIVERED) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Service progress cannot be updated at status: "
                            + currentStatus);
        }

        // =====================================================
        // FIND WORKER
        // =====================================================

        Worker worker = workerRepository
                .findByEmail(workerEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Worker not found"));

        // =====================================================
        // GET OR CREATE PROGRESS
        // =====================================================

        VehicleServiceProgress progress = progressRepository.findByBookingId(bookingId)
                .orElseGet(VehicleServiceProgress::new);

        progress.setBooking(booking);
        progress.setWorker(worker);

        // =====================================================
        // DRYING
        // =====================================================

        if (request.getDryingMethod() != null) {
            progress.setDryingMethod(
                    request.getDryingMethod());
        }

        progress.setBodyCompletelyDry(
                request.isBodyCompletelyDry());

        progress.setGlassDry(
                request.isGlassDry());

        progress.setWheelsDry(
                request.isWheelsDry());

        progress.setNoWaterSpots(
                request.isNoWaterSpots());

        if (request.getDryingNotes() != null) {
            progress.setDryingNotes(
                    request.getDryingNotes());
        }

        // -----------------------------------------------------
        // Drying Started
        // -----------------------------------------------------

        if (currentStatus == BookingStatus.DRYING
                && progress.getDryingStartedAt() == null) {

            progress.setDryingStartedAt(
                    LocalDateTime.now());
        }

        // -----------------------------------------------------
        // Drying Completed
        // -----------------------------------------------------

        if (request.isDryingCompleted()) {

            if (progress.getDryingStartedAt() == null) {
                progress.setDryingStartedAt(
                        LocalDateTime.now());
            }

            progress.setDryingCompletedAt(
                    LocalDateTime.now());
        }

        // =====================================================
        // QUALITY CHECK
        // =====================================================

        progress.setExteriorChecked(
                request.isExteriorChecked());

        progress.setInteriorChecked(
                request.isInteriorChecked());

        progress.setGlassChecked(
                request.isGlassChecked());

        progress.setWheelsChecked(
                request.isWheelsChecked());

        progress.setPaintChecked(
                request.isPaintChecked());

        progress.setNoVisibleDefects(
                request.isNoVisibleDefects());

        if (request.getQualityNotes() != null) {
            progress.setQualityNotes(
                    request.getQualityNotes());
        }

        // -----------------------------------------------------
        // Quality Check Completed
        // -----------------------------------------------------

        if (request.isQualityCheckCompleted()) {

            progress.setQualityCheckAt(
                    LocalDateTime.now());
        }

        // =====================================================
        // COMPLETED
        // =====================================================

        progress.setServiceCompleted(
                request.isServiceCompleted());

        progress.setVehicleReady(
                request.isVehicleReady());

        if (request.getCompletionNotes() != null) {
            progress.setCompletionNotes(
                    request.getCompletionNotes());
        }

        // -----------------------------------------------------
        // Service Completed Time
        // -----------------------------------------------------

        if (request.isServiceCompleted()) {

            progress.setCompletedAt(
                    LocalDateTime.now());
        }

        // =====================================================
        // DELIVERED
        // =====================================================

        progress.setVehicleHandedOver(
                request.isVehicleHandedOver());

        progress.setCustomerReceived(
                request.isCustomerReceived());

        if (request.getDeliveryNotes() != null) {
            progress.setDeliveryNotes(
                    request.getDeliveryNotes());
        }

        // -----------------------------------------------------
        // Delivered Time
        // -----------------------------------------------------

        if (request.isCustomerReceived()) {

            progress.setDeliveredAt(
                    LocalDateTime.now());
        }

        // =====================================================
        // SAVE PROGRESS
        // =====================================================

        VehicleServiceProgress saved = progressRepository.save(progress);

        // =====================================================
        // UPDATE BOOKING STATUS
        // =====================================================

        BookingStatus nextStatus = calculateNextStatus(
                booking,
                request);

        if (nextStatus != null
                && nextStatus != booking.getStatus()) {

            booking.setStatus(nextStatus);

            bookingRepository.save(booking);
        }

        bookingRepository.flush();

        return mapToResponse(
                saved,
                booking);
    }

    // =========================================================
    // FIND BOOKING + VERIFY WORKER
    // =========================================================

    private Booking getWorkerBooking(
            Long bookingId,
            String workerEmail) {

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found"));

        // -----------------------------------------------------
        // Check Worker Assigned
        // -----------------------------------------------------

        if (booking.getWorker() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No worker assigned to this booking");
        }

        // -----------------------------------------------------
        // Check Logged-in Worker
        // -----------------------------------------------------

        if (!booking.getWorker()
                .getEmail()
                .equalsIgnoreCase(workerEmail)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not assigned to this booking");
        }

        return booking;
    }

    // =========================================================
    // CALCULATE NEXT STATUS
    // =========================================================

    private BookingStatus calculateNextStatus(
            Booking booking,
            ServiceProgressRequest request) {

        BookingStatus currentStatus = booking.getStatus();

        // =====================================================
        // WASHING → DRYING
        // =====================================================

        if (currentStatus == BookingStatus.WASHING
                && request.isDryingCompleted()) {

            return BookingStatus.DRYING;
        }

        // =====================================================
        // DRYING → QUALITY CHECK
        // =====================================================

        if (currentStatus == BookingStatus.DRYING
                && request.isQualityCheckCompleted()) {

            return BookingStatus.QUALITY_CHECK;
        }

        // =====================================================
        // QUALITY CHECK → COMPLETED
        // =====================================================

        if (currentStatus == BookingStatus.QUALITY_CHECK
                && request.isServiceCompleted()
                && request.isVehicleReady()) {

            return BookingStatus.COMPLETED;
        }

        // =====================================================
        // COMPLETED → DELIVERED
        // =====================================================

        if (currentStatus == BookingStatus.COMPLETED
                && request.isVehicleHandedOver()
                && request.isCustomerReceived()) {

            return BookingStatus.DELIVERED;
        }

        return null;
    }

    // =========================================================
    // EMPTY RESPONSE
    // =========================================================

    private ServiceProgressResponse createEmptyResponse(
            Booking booking) {

        ServiceProgressResponse response = new ServiceProgressResponse();

        response.setBookingId(
                booking.getId());

        response.setCurrentStatus(
                booking.getStatus().name());

        return response;
    }

    // =========================================================
    // ENTITY → RESPONSE
    // =========================================================

    private ServiceProgressResponse mapToResponse(
            VehicleServiceProgress progress,
            Booking booking) {

        ServiceProgressResponse response = new ServiceProgressResponse();

        response.setId(
                progress.getId());

        response.setBookingId(
                booking.getId());

        response.setCurrentStatus(
                booking.getStatus().name());

        // =====================================================
        // DRYING
        // =====================================================

        response.setDryingMethod(
                progress.getDryingMethod());

        response.setBodyCompletelyDry(
                progress.isBodyCompletelyDry());

        response.setGlassDry(
                progress.isGlassDry());

        response.setWheelsDry(
                progress.isWheelsDry());

        response.setNoWaterSpots(
                progress.isNoWaterSpots());

        response.setDryingNotes(
                progress.getDryingNotes());

        response.setDryingStartedAt(
                progress.getDryingStartedAt());

        response.setDryingCompletedAt(
                progress.getDryingCompletedAt());

        // =====================================================
        // QUALITY CHECK
        // =====================================================

        response.setExteriorChecked(
                progress.isExteriorChecked());

        response.setInteriorChecked(
                progress.isInteriorChecked());

        response.setGlassChecked(
                progress.isGlassChecked());

        response.setWheelsChecked(
                progress.isWheelsChecked());

        response.setPaintChecked(
                progress.isPaintChecked());

        response.setNoVisibleDefects(
                progress.isNoVisibleDefects());

        response.setQualityNotes(
                progress.getQualityNotes());

        response.setQualityCheckAt(
                progress.getQualityCheckAt());

        // =====================================================
        // COMPLETED
        // =====================================================

        response.setServiceCompleted(
                progress.isServiceCompleted());

        response.setVehicleReady(
                progress.isVehicleReady());

        response.setCompletionNotes(
                progress.getCompletionNotes());

        response.setCompletedAt(
                progress.getCompletedAt());

        // =====================================================
        // DELIVERED
        // =====================================================

        response.setVehicleHandedOver(
                progress.isVehicleHandedOver());

        response.setCustomerReceived(
                progress.isCustomerReceived());

        response.setDeliveryNotes(
                progress.getDeliveryNotes());

        response.setDeliveredAt(
                progress.getDeliveredAt());

        return response;
    }
}