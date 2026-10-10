package com.autoglow.backend.service;

import com.autoglow.backend.dto.AIInspectionResponse;
import com.autoglow.backend.dto.WorkerInspectionResponse;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.BookingStatus;
import com.autoglow.backend.entity.Worker;
import com.autoglow.backend.repository.BookingRepository;
import com.autoglow.backend.repository.WorkerRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Transactional
public class WorkerAIInspectionService {

    private final WorkerRepository workerRepository;
    private final BookingRepository bookingRepository;
    private final AdminAIInspectionService adminAIInspectionService;
    private final AIInspectionFileService fileService;

    public WorkerAIInspectionService(
            WorkerRepository workerRepository,
            BookingRepository bookingRepository,
            AdminAIInspectionService adminAIInspectionService,
            AIInspectionFileService fileService) {

        this.workerRepository = workerRepository;
        this.bookingRepository = bookingRepository;
        this.adminAIInspectionService = adminAIInspectionService;
        this.fileService = fileService;
    }

    // =========================================================
    // GET INSPECTION FOR WORKER
    // =========================================================

    @Transactional(readOnly = true)
    public WorkerInspectionResponse getInspection(
            Long bookingId,
            String workerEmail) {

        Worker worker = getWorker(workerEmail);

        Booking booking = getWorkerBooking(
                bookingId,
                worker);

        WorkerInspectionResponse response = buildBaseResponse(booking);

        String vehicleNumber = booking.getVehicle()
                .getRegistrationNumber();

        /*
         * Existing AdminAIInspectionService already converts
         * AIInspection entity into AIInspectionResponse.
         *
         * So we do NOT directly call AIInspectionRepository here.
         */
        List<AIInspectionResponse> inspections = adminAIInspectionService
                .getByVehicleNumber(vehicleNumber);

        if (!inspections.isEmpty()) {

            AIInspectionResponse latest = inspections.get(0);

            response.setInspectionId(
                    latest.getId());

            response.setInspection(
                    latest);

            response.setStatus(
                    latest.getStatus());

        } else {

            response.setInspectionId(null);

            response.setInspection(null);

            response.setStatus(
                    booking.getStatus() != null
                            ? booking.getStatus().name()
                            : "RECEIVED");
        }

        return response;
    }

    // =========================================================
    // CREATE INSPECTION + UPLOAD IMAGE
    // =========================================================

    public WorkerInspectionResponse createInspection(
            Long bookingId,
            String workerEmail,
            MultipartFile image) {

        Worker worker = getWorker(workerEmail);

        Booking booking = getWorkerBooking(
                bookingId,
                worker);

        validateInspectionBooking(booking);

        if (image == null || image.isEmpty()) {

            throw new IllegalArgumentException(
                    "Vehicle inspection image is required.");
        }

        String imageUrl = null;

        try {

            // -------------------------------------------------
            // SAVE VEHICLE IMAGE
            // -------------------------------------------------

            imageUrl = fileService.saveImage(image);

            // -------------------------------------------------
            // CREATE INSPECTION
            // -------------------------------------------------

            AIInspectionResponse inspection = adminAIInspectionService.createInspection(
                    booking.getVehicle()
                            .getRegistrationNumber(),

                    booking.getVehicle()
                            .getVehicleType(),

                    imageUrl);

            // -------------------------------------------------
            // MOVE BOOKING TO INSPECTION
            // -------------------------------------------------

            if (booking.getStatus() == BookingStatus.RECEIVED) {

                booking.setStatus(
                        BookingStatus.INSPECTION);

                bookingRepository.save(booking);
            }

            // -------------------------------------------------
            // BUILD RESPONSE
            // -------------------------------------------------

            WorkerInspectionResponse response = buildBaseResponse(booking);

            response.setInspectionId(
                    inspection.getId());

            response.setInspection(
                    inspection);

            response.setStatus(
                    inspection.getStatus());

            return response;

        } catch (Exception ex) {

            /*
             * If inspection creation fails after image upload,
             * delete the uploaded image.
             */

            if (imageUrl != null) {

                try {

                    fileService.deleteImage(
                            imageUrl);

                } catch (Exception ignored) {

                    // Preserve original exception.
                }
            }

            throw new RuntimeException(
                    "Unable to create vehicle inspection: "
                            + safeMessage(ex),
                    ex);
        }
    }

    // =========================================================
    // PROCESS AI INSPECTION
    // =========================================================

    public WorkerInspectionResponse processInspection(
            Long bookingId,
            String workerEmail) {

        Worker worker = getWorker(workerEmail);

        Booking booking = getWorkerBooking(
                bookingId,
                worker);

        String vehicleNumber = booking.getVehicle()
                .getRegistrationNumber();

        /*
         * Use existing AdminAIInspectionService instead of
         * directly using AIInspectionRepository.
         */
        List<AIInspectionResponse> inspections = adminAIInspectionService
                .getByVehicleNumber(vehicleNumber);

        if (inspections.isEmpty()) {

            throw new RuntimeException(
                    "No inspection found for booking #"
                            + bookingId);
        }

        AIInspectionResponse latest = inspections.get(0);

        if (latest.getId() == null) {

            throw new RuntimeException(
                    "Inspection ID is missing.");
        }

        // -----------------------------------------------------
        // PROCESS EXISTING INSPECTION
        // -----------------------------------------------------

        AIInspectionResponse processed = adminAIInspectionService
                .processInspection(
                        latest.getId());

        // -----------------------------------------------------
        // BUILD RESPONSE
        // -----------------------------------------------------

        WorkerInspectionResponse response = buildBaseResponse(booking);

        response.setInspectionId(
                processed.getId());

        response.setInspection(
                processed);

        response.setStatus(
                processed.getStatus());

        return response;
    }

    // =========================================================
    // GET WORKER
    // =========================================================

    private Worker getWorker(String email) {

        if (email == null
                || email.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Worker email is required.");
        }

        return workerRepository
                .findByEmail(email.trim())
                .orElseThrow(
                        () -> new RuntimeException(
                                "Worker not found."));
    }

    // =========================================================
    // GET BOOKING + VERIFY WORKER
    // =========================================================

    private Booking getWorkerBooking(
            Long bookingId,
            Worker worker) {

        if (bookingId == null) {

            throw new IllegalArgumentException(
                    "Booking ID is required.");
        }

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Booking not found: "
                                        + bookingId));

        // -----------------------------------------------------
        // CHECK WORKER ASSIGNMENT
        // -----------------------------------------------------

        if (booking.getWorker() == null) {

            throw new RuntimeException(
                    "No worker is assigned to booking #"
                            + bookingId);
        }

        // -----------------------------------------------------
        // SECURITY CHECK
        // -----------------------------------------------------

        if (!booking.getWorker()
                .getId()
                .equals(worker.getId())) {

            throw new RuntimeException(
                    "You are not authorized to inspect "
                            + "this booking.");
        }

        // -----------------------------------------------------
        // VEHICLE CHECK
        // -----------------------------------------------------

        if (booking.getVehicle() == null) {

            throw new RuntimeException(
                    "Vehicle information is missing "
                            + "for booking #"
                            + bookingId);
        }

        return booking;
    }

    // =========================================================
    // VALIDATE INSPECTION WORKFLOW
    // =========================================================

    private void validateInspectionBooking(
            Booking booking) {

        BookingStatus status = booking.getStatus();

        if (status == null) {

            throw new RuntimeException(
                    "Booking status is missing.");
        }

        if (status != BookingStatus.RECEIVED
                && status != BookingStatus.INSPECTION) {

            throw new RuntimeException(
                    "Vehicle inspection cannot be started "
                            + "from status: "
                            + status.name());
        }
    }

    // =========================================================
    // BUILD WORKER RESPONSE
    // =========================================================

    private WorkerInspectionResponse buildBaseResponse(
            Booking booking) {

        WorkerInspectionResponse response = new WorkerInspectionResponse();

        response.setBookingId(
                booking.getId());

        response.setVehicleNumber(
                booking.getVehicle()
                        .getRegistrationNumber());

        response.setVehicleType(
                booking.getVehicle()
                        .getVehicleType());

        response.setVehicleBrand(
                booking.getVehicle()
                        .getBrand());

        response.setVehicleModel(
                booking.getVehicle()
                        .getModel());

        if (booking.getStatus() != null) {

            response.setStatus(
                    booking.getStatus().name());
        }

        return response;
    }

    // =========================================================
    // SAFE ERROR MESSAGE
    // =========================================================

    private String safeMessage(Exception ex) {

        if (ex == null) {
            return "Unknown error";
        }

        String message = ex.getMessage();

        if (message == null
                || message.trim().isEmpty()) {

            return ex.getClass()
                    .getSimpleName();
        }

        return message.trim();
    }
}