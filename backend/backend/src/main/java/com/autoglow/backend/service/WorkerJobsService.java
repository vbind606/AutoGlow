package com.autoglow.backend.service;

import com.autoglow.backend.dto.WorkerDashboardResponse;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.BookingStatus;
import com.autoglow.backend.entity.User;
import com.autoglow.backend.entity.Vehicle;
import com.autoglow.backend.entity.Worker;
import com.autoglow.backend.repository.BookingRepository;
import com.autoglow.backend.repository.WorkerRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class WorkerJobsService {

    private final WorkerRepository workerRepository;
    private final BookingRepository bookingRepository;

    public WorkerJobsService(
            WorkerRepository workerRepository,
            BookingRepository bookingRepository) {

        this.workerRepository = workerRepository;
        this.bookingRepository = bookingRepository;
    }

    // =========================================================
    // FIND WORKER BY LOGIN EMAIL
    // =========================================================

    private Worker getWorker(String email) {

        return workerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException(
                        "Worker account not found for email: " + email));
    }

    // =========================================================
    // GET WORKER JOBS
    // =========================================================

    @Transactional(readOnly = true)
    public List<WorkerDashboardResponse.WorkerBookingResponse> getMyJobs(
            String email) {

        Worker worker = getWorker(email);

        List<Booking> bookings = bookingRepository
                .findByWorkerOrderByBookingDateAscBookingTimeAsc(
                        worker);

        List<WorkerDashboardResponse.WorkerBookingResponse> response = new ArrayList<>();

        for (Booking booking : bookings) {

            response.add(
                    mapBooking(booking));
        }

        return response;
    }

    // =========================================================
    // UPDATE JOB STATUS
    // =========================================================

    @Transactional
    public WorkerDashboardResponse.WorkerBookingResponse updateJobStatus(
            String email,
            Long bookingId,
            BookingStatus newStatus) {

        if (bookingId == null) {
            throw new RuntimeException(
                    "Booking ID is required.");
        }

        if (newStatus == null) {
            throw new RuntimeException(
                    "Booking status is required.");
        }

        Worker worker = getWorker(email);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException(
                        "Booking not found with ID: " + bookingId));

        // -----------------------------------------------------
        // CHECK WORKER ASSIGNMENT
        // -----------------------------------------------------

        if (booking.getWorker() == null) {

            throw new RuntimeException(
                    "This booking is not assigned to any worker.");
        }

        if (booking.getWorker().getId() == null) {

            throw new RuntimeException(
                    "Assigned worker ID is missing.");
        }

        if (worker.getId() == null) {

            throw new RuntimeException(
                    "Logged-in worker ID is missing.");
        }

        if (!booking.getWorker().getId().equals(worker.getId())) {

            throw new RuntimeException(
                    "You are not authorized to update this job.");
        }

        // -----------------------------------------------------
        // VALIDATE STATUS
        // -----------------------------------------------------

        validateWorkerStatus(newStatus);

        // -----------------------------------------------------
        // UPDATE
        // -----------------------------------------------------

        booking.setStatus(newStatus);

        Booking savedBooking = bookingRepository.save(booking);

        bookingRepository.flush();

        return mapBooking(savedBooking);
    }

    // =========================================================
    // WORKER ALLOWED STATUS
    // =========================================================

    private void validateWorkerStatus(BookingStatus status) {

        if (status == null) {

            throw new IllegalArgumentException(
                    "Booking status cannot be null.");
        }

        switch (status) {

            case RECEIVED:
            case INSPECTION:
            case WASHING:
            case DRYING:
            case QUALITY_CHECK:
            case COMPLETED:
            case DELIVERED:

                return;

            case ASSIGNED:
                throw new IllegalArgumentException(
                        "ASSIGNED status is controlled by Admin.");

            case PENDING:
            case CONFIRMED:
                throw new IllegalArgumentException(
                        "Worker cannot set this status.");

            case CANCELLED:
                throw new IllegalArgumentException(
                        "Cancelled status can only be managed by Admin.");

            default:
                throw new IllegalArgumentException(
                        "Worker cannot set this status.");
        }
    }

    // =========================================================
    // MAP BOOKING TO RESPONSE
    // =========================================================

    private WorkerDashboardResponse.WorkerBookingResponse mapBooking(
            Booking booking) {

        WorkerDashboardResponse.WorkerBookingResponse response = new WorkerDashboardResponse.WorkerBookingResponse();

        // -----------------------------------------------------
        // BOOKING
        // -----------------------------------------------------

        response.setBookingId(
                booking.getId());

        response.setBookingDate(
                booking.getBookingDate());

        response.setBookingTime(
                booking.getBookingTime());

        response.setStatus(
                booking.getStatus() != null
                        ? booking.getStatus().name()
                        : null);

        response.setTotalAmount(
                booking.getTotalAmount());

        // -----------------------------------------------------
        // CUSTOMER
        // -----------------------------------------------------

        User user = booking.getUser();

        if (user != null) {

            response.setCustomerName(
                    user.getName());

            response.setCustomerEmail(
                    user.getEmail());
        }

        // -----------------------------------------------------
        // VEHICLE
        // -----------------------------------------------------

        Vehicle vehicle = booking.getVehicle();

        if (vehicle != null) {

            response.setVehicleNumber(
                    vehicle.getRegistrationNumber());

            response.setVehicleType(
                    vehicle.getVehicleType());

            response.setVehicleBrand(
                    vehicle.getBrand());

            response.setVehicleModel(
                    vehicle.getModel());
        }

        // -----------------------------------------------------
        // SERVICE
        // -----------------------------------------------------

        if (booking.getService() != null) {

            response.setServiceName(
                    booking.getService().getName());
        }

        // -----------------------------------------------------
        // PACKAGE
        // -----------------------------------------------------

        if (booking.getServicePackage() != null) {

            response.setPackageName(
                    booking.getServicePackage().getName());
        }

        // -----------------------------------------------------
        // PICKUP / DROP
        // -----------------------------------------------------

        response.setPickupRequired(
                booking.isPickupRequired());

        response.setPickupAddress(
                booking.getPickupAddress());

        response.setDropRequired(
                booking.isDropRequired());

        response.setDropAddress(
                booking.getDropAddress());

        // -----------------------------------------------------
        // NOTES
        // -----------------------------------------------------

        response.setNotes(
                booking.getNotes());

        return response;
    }
}