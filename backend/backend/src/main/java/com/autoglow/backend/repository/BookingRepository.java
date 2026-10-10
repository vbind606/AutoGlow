package com.autoglow.backend.repository;

import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.BookingStatus;
import com.autoglow.backend.entity.User;
import com.autoglow.backend.entity.Worker;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

        // =========================================================
        // CUSTOMER BOOKING QUERIES
        // =========================================================

        List<Booking> findByUserOrderByBookingDateDescBookingTimeDesc(
                        User user);

        Optional<Booking> findByIdAndUser(
                        Long id,
                        User user);

        // =========================================================
        // ADMIN / GENERAL BOOKING QUERIES
        // =========================================================

        long countByStatus(
                        BookingStatus status);

        List<Booking> findTop5ByOrderByIdDesc();

        List<Booking> findAllByOrderByIdDesc();

        // =========================================================
        // WORKER BOOKING QUERIES
        // =========================================================

        // Get all bookings assigned to a worker
        List<Booking> findByWorkerOrderByBookingDateAscBookingTimeAsc(
                        Worker worker);

        // Get bookings of a worker by status
        List<Booking> findByWorkerAndStatusOrderByBookingDateAscBookingTimeAsc(
                        Worker worker,
                        BookingStatus status);

        // Count all bookings assigned to a worker
        long countByWorker(
                        Worker worker);

        // Count worker bookings by status
        long countByWorkerAndStatus(
                        Worker worker,
                        BookingStatus status);

        // Get today's bookings for worker
        List<Booking> findByWorkerAndBookingDateOrderByBookingTimeAsc(
                        Worker worker,
                        LocalDate bookingDate);

        // Get today's bookings by status
        List<Booking> findByWorkerAndBookingDateAndStatusOrderByBookingTimeAsc(
                        Worker worker,
                        LocalDate bookingDate,
                        BookingStatus status);

        // Get upcoming bookings from a particular date
        List<Booking> findByWorkerAndBookingDateGreaterThanEqualOrderByBookingDateAscBookingTimeAsc(
                        Worker worker,
                        LocalDate bookingDate);

        // Get recent bookings assigned to worker
        List<Booking> findTop5ByWorkerOrderByBookingDateDescBookingTimeDesc(
                        Worker worker);
}