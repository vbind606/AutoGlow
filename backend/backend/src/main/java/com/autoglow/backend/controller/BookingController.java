package com.autoglow.backend.controller;

import com.autoglow.backend.dto.BookingRequest;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.service.BookingService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(
            BookingService bookingService) {

        this.bookingService = bookingService;
    }

    // =========================================================
    // CREATE BOOKING
    // POST /api/customer/bookings
    // =========================================================

    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @RequestBody BookingRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        Booking booking = bookingService.createBooking(
                request,
                email);

        return ResponseEntity.ok(booking);
    }

    // =========================================================
    // GET MY BOOKINGS
    // GET /api/customer/bookings
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Booking>> getMyBookings(
            Authentication authentication) {

        String email = authentication.getName();

        List<Booking> bookings = bookingService.getMyBookings(email);

        return ResponseEntity.ok(bookings);
    }

    // =========================================================
    // GET MY SERVICE HISTORY
    // GET /api/customer/bookings/history
    // =========================================================

    @GetMapping("/history")
    public ResponseEntity<List<Booking>> getMyServiceHistory(
            Authentication authentication) {

        String email = authentication.getName();

        List<Booking> history = bookingService.getMyServiceHistory(email);

        return ResponseEntity.ok(history);
    }

    // =========================================================
    // GET SINGLE BOOKING
    // GET /api/customer/bookings/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        Booking booking = bookingService.getBookingById(
                email,
                id);

        return ResponseEntity.ok(booking);
    }

    // =========================================================
    // GET BOOKING TRACKING
    // GET /api/customer/bookings/{id}/tracking
    // =========================================================

    @GetMapping("/{id}/tracking")
    public ResponseEntity<Booking> getBookingTracking(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        Booking booking = bookingService.getBookingById(
                email,
                id);

        return ResponseEntity.ok(booking);
    }
}