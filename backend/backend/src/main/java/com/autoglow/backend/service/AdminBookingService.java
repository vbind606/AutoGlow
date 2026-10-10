package com.autoglow.backend.service;

import com.autoglow.backend.dto.AdminBookingResponse;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.BookingStatus;
import com.autoglow.backend.entity.Worker;
import com.autoglow.backend.repository.BookingRepository;
import com.autoglow.backend.repository.WorkerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminBookingService {

    private final BookingRepository bookingRepository;
    private final WorkerRepository workerRepository;

    public AdminBookingService(
            BookingRepository bookingRepository,
            WorkerRepository workerRepository) {

        this.bookingRepository = bookingRepository;
        this.workerRepository = workerRepository;
    }

    // ==========================================
    // GET ALL BOOKINGS
    // ==========================================

    public List<AdminBookingResponse> getAllBookings() {

        List<Booking> bookings = bookingRepository.findAllByOrderByIdDesc();

        return bookings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ==========================================
    // GET SINGLE BOOKING
    // ==========================================

    public AdminBookingResponse getBookingById(Long id) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        return convertToResponse(booking);
    }

    // ==========================================
    // ASSIGN WORKER
    // ==========================================

    public AdminBookingResponse assignWorker(
            Long bookingId,
            Long workerId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        // Check worker is active
        if (!worker.isActive()) {
            throw new RuntimeException(
                    "Selected worker is currently inactive");
        }

        // Assign worker
        booking.setWorker(worker);

        // Automatically move booking to ASSIGNED
        booking.setStatus(BookingStatus.ASSIGNED);

        Booking savedBooking = bookingRepository.save(booking);

        return convertToResponse(savedBooking);
    }

    // ==========================================
    // UPDATE BOOKING STATUS
    // ==========================================

    public AdminBookingResponse updateStatus(
            Long bookingId,
            String status) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (status == null || status.trim().isEmpty()) {
            throw new RuntimeException(
                    "Booking status is required");
        }

        BookingStatus newStatus;

        try {

            newStatus = BookingStatus.valueOf(
                    status.trim().toUpperCase());

        } catch (IllegalArgumentException e) {

            throw new RuntimeException(
                    "Invalid booking status: " + status);
        }

        booking.setStatus(newStatus);

        Booking savedBooking = bookingRepository.save(booking);

        return convertToResponse(savedBooking);
    }

    // ==========================================
    // CONVERT ENTITY TO RESPONSE
    // ==========================================

    private AdminBookingResponse convertToResponse(
            Booking booking) {

        String vehicleName = "Vehicle #" + booking.getVehicle().getId();

        String registrationNumber = booking.getVehicle().getRegistrationNumber();

        String serviceName = "No Service";

        if (booking.getService() != null) {
            serviceName = booking.getService().getName();
        }

        String packageName = "No Package";

        if (booking.getServicePackage() != null) {
            packageName = booking.getServicePackage().getName();
        }

        return new AdminBookingResponse(

                // Booking
                booking.getId(),

                // Customer
                booking.getUser().getId(),
                booking.getUser().getName(),
                booking.getUser().getEmail(),

                // Vehicle
                booking.getVehicle().getId(),
                vehicleName,
                registrationNumber,

                // Service
                serviceName,
                packageName,

                // Date & Time
                booking.getBookingDate(),
                booking.getBookingTime(),

                // Pickup / Drop
                booking.isPickupRequired(),
                booking.isDropRequired(),

                booking.getPickupAddress(),
                booking.getDropAddress(),

                // Amount
                booking.getTotalAmount(),

                // Status
                booking.getStatus().name(),

                // Notes
                booking.getNotes());
    }
}