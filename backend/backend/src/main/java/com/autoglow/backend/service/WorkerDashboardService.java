package com.autoglow.backend.service;

import com.autoglow.backend.dto.WorkerDashboardResponse;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.BookingStatus;
import com.autoglow.backend.entity.Worker;
import com.autoglow.backend.repository.BookingRepository;
import com.autoglow.backend.repository.WorkerRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class WorkerDashboardService {

    private final WorkerRepository workerRepository;
    private final BookingRepository bookingRepository;

    public WorkerDashboardService(
            WorkerRepository workerRepository,
            BookingRepository bookingRepository) {

        this.workerRepository = workerRepository;
        this.bookingRepository = bookingRepository;
    }

    // =========================================================
    // GET WORKER DASHBOARD
    // =========================================================

    @Transactional(readOnly = true)
    public WorkerDashboardResponse getDashboard(String email) {

        // -----------------------------------------------------
        // 1. FIND WORKER USING LOGGED-IN EMAIL
        // -----------------------------------------------------

        Worker worker = workerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Worker not found for email: " + email));

        // -----------------------------------------------------
        // 2. CREATE RESPONSE
        // -----------------------------------------------------

        WorkerDashboardResponse response = new WorkerDashboardResponse();

        // -----------------------------------------------------
        // 3. WORKER INFORMATION
        // -----------------------------------------------------

        response.setWorkerId(worker.getId());
        response.setWorkerName(worker.getName());
        response.setWorkerEmail(worker.getEmail());
        response.setWorkerPhone(worker.getPhone());
        response.setSpecialization(worker.getSpecialization());
        response.setActive(worker.isActive());

        // -----------------------------------------------------
        // 4. TOTAL ASSIGNED BOOKINGS
        // -----------------------------------------------------

        long totalAssigned = bookingRepository.countByWorker(worker);

        response.setTotalAssigned(totalAssigned);

        // -----------------------------------------------------
        // 5. PENDING JOBS
        // -----------------------------------------------------

        long pendingJobs = getPendingJobCount(worker);

        response.setPendingJobs(pendingJobs);

        // -----------------------------------------------------
        // 6. IN-PROGRESS JOBS
        // -----------------------------------------------------

        long inProgressJobs = getInProgressJobCount(worker);

        response.setInProgressJobs(inProgressJobs);

        // -----------------------------------------------------
        // 7. COMPLETED JOBS
        // -----------------------------------------------------

        long completedJobs = getCompletedJobCount(worker);

        response.setCompletedJobs(completedJobs);

        // -----------------------------------------------------
        // 8. CANCELLED JOBS
        // -----------------------------------------------------

        long cancelledJobs = bookingRepository.countByWorkerAndStatus(
                worker,
                BookingStatus.CANCELLED);

        response.setCancelledJobs(cancelledJobs);

        // -----------------------------------------------------
        // 9. TODAY'S JOBS
        // -----------------------------------------------------

        LocalDate today = LocalDate.now();

        List<Booking> todayBookings = bookingRepository
                .findByWorkerAndBookingDateOrderByBookingTimeAsc(
                        worker,
                        today);

        List<WorkerDashboardResponse.WorkerBookingResponse> todayJobs = convertBookings(todayBookings);

        response.setTodayJobs(todayJobs);

        // -----------------------------------------------------
        // 10. UPCOMING JOBS
        // -----------------------------------------------------

        List<Booking> upcomingBookings = bookingRepository
                .findByWorkerAndBookingDateGreaterThanEqualOrderByBookingDateAscBookingTimeAsc(
                        worker,
                        today);

        // Remove today's completed/cancelled jobs from upcoming
        List<WorkerDashboardResponse.WorkerBookingResponse> upcomingJobs = new ArrayList<>();

        for (Booking booking : upcomingBookings) {

            if (booking.getBookingDate().equals(today)
                    && isCompletedOrCancelled(booking.getStatus())) {
                continue;
            }

            upcomingJobs.add(convertBooking(booking));
        }

        response.setUpcomingJobs(upcomingJobs);

        // -----------------------------------------------------
        // 11. RECENT JOBS
        // -----------------------------------------------------

        List<Booking> recentBookings = bookingRepository
                .findTop5ByWorkerOrderByBookingDateDescBookingTimeDesc(
                        worker);

        List<WorkerDashboardResponse.WorkerBookingResponse> recentJobs = convertBookings(recentBookings);

        response.setRecentJobs(recentJobs);

        return response;
    }

    // =========================================================
    // PENDING JOB COUNT
    // =========================================================

    private long getPendingJobCount(Worker worker) {

        long pending = bookingRepository.countByWorkerAndStatus(
                worker,
                BookingStatus.PENDING);

        long confirmed = bookingRepository.countByWorkerAndStatus(
                worker,
                BookingStatus.CONFIRMED);

        long assigned = bookingRepository.countByWorkerAndStatus(
                worker,
                BookingStatus.ASSIGNED);

        return pending + confirmed + assigned;
    }

    // =========================================================
    // IN-PROGRESS JOB COUNT
    // =========================================================

    private long getInProgressJobCount(Worker worker) {

        long received = bookingRepository.countByWorkerAndStatus(
                worker,
                BookingStatus.RECEIVED);

        long inspection = bookingRepository.countByWorkerAndStatus(
                worker,
                BookingStatus.INSPECTION);

        long washing = bookingRepository.countByWorkerAndStatus(
                worker,
                BookingStatus.WASHING);

        long drying = bookingRepository.countByWorkerAndStatus(
                worker,
                BookingStatus.DRYING);

        long qualityCheck = bookingRepository.countByWorkerAndStatus(
                worker,
                BookingStatus.QUALITY_CHECK);

        return received
                + inspection
                + washing
                + drying
                + qualityCheck;
    }

    // =========================================================
    // COMPLETED JOB COUNT
    // =========================================================

    private long getCompletedJobCount(Worker worker) {

        long completed = bookingRepository.countByWorkerAndStatus(
                worker,
                BookingStatus.COMPLETED);

        long delivered = bookingRepository.countByWorkerAndStatus(
                worker,
                BookingStatus.DELIVERED);

        return completed + delivered;
    }

    // =========================================================
    // CHECK COMPLETED / CANCELLED
    // =========================================================

    private boolean isCompletedOrCancelled(BookingStatus status) {

        return status == BookingStatus.COMPLETED
                || status == BookingStatus.DELIVERED
                || status == BookingStatus.CANCELLED;
    }

    // =========================================================
    // CONVERT BOOKING LIST
    // =========================================================

    private List<WorkerDashboardResponse.WorkerBookingResponse> convertBookings(
            List<Booking> bookings) {

        List<WorkerDashboardResponse.WorkerBookingResponse> responseList = new ArrayList<>();

        for (Booking booking : bookings) {
            responseList.add(convertBooking(booking));
        }

        return responseList;
    }

    // =========================================================
    // CONVERT SINGLE BOOKING
    // =========================================================

    private WorkerDashboardResponse.WorkerBookingResponse convertBooking(
            Booking booking) {

        WorkerDashboardResponse.WorkerBookingResponse response = new WorkerDashboardResponse.WorkerBookingResponse();

        // -----------------------------------------------------
        // BOOKING INFORMATION
        // -----------------------------------------------------

        response.setBookingId(booking.getId());
        response.setBookingDate(booking.getBookingDate());
        response.setBookingTime(booking.getBookingTime());

        if (booking.getStatus() != null) {
            response.setStatus(
                    booking.getStatus().name());
        }

        response.setTotalAmount(booking.getTotalAmount());

        // -----------------------------------------------------
        // PICKUP / DROP
        // -----------------------------------------------------

        response.setPickupRequired(
                booking.isPickupRequired());

        response.setDropRequired(
                booking.isDropRequired());

        response.setPickupAddress(
                booking.getPickupAddress());

        response.setDropAddress(
                booking.getDropAddress());

        response.setNotes(
                booking.getNotes());

        // -----------------------------------------------------
        // CUSTOMER INFORMATION
        // -----------------------------------------------------

        if (booking.getUser() != null) {

            response.setCustomerName(
                    booking.getUser().getName());

            response.setCustomerEmail(
                    booking.getUser().getEmail());

        
        }

        // -----------------------------------------------------
        // VEHICLE INFORMATION
        // -----------------------------------------------------

        if (booking.getVehicle() != null) {

            response.setVehicleNumber(
                    booking.getVehicle().getRegistrationNumber());
            response.setVehicleType(
                    booking.getVehicle().getVehicleType());

            response.setVehicleBrand(
                    booking.getVehicle().getBrand());

            response.setVehicleModel(
                    booking.getVehicle().getModel());
        }

        // -----------------------------------------------------
        // SERVICE INFORMATION
        // -----------------------------------------------------

        if (booking.getService() != null) {

            response.setServiceName(
                    booking.getService().getName());
        }

        // -----------------------------------------------------
        // PACKAGE INFORMATION
        // -----------------------------------------------------

        if (booking.getServicePackage() != null) {

            response.setPackageName(
                    booking.getServicePackage().getName());
        }

        return response;
    }
}