package com.autoglow.backend.controller;

import com.autoglow.backend.dto.AdminBookingResponse;
import com.autoglow.backend.dto.AssignWorkerRequest;
import com.autoglow.backend.dto.UpdateBookingStatusRequest;
import com.autoglow.backend.service.AdminBookingService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminBookingController {

    private final AdminBookingService adminBookingService;

    public AdminBookingController(
            AdminBookingService adminBookingService) {

        this.adminBookingService = adminBookingService;
    }

    // ==========================================
    // GET ALL BOOKINGS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<AdminBookingResponse>> getAllBookings() {

        return ResponseEntity.ok(
                adminBookingService.getAllBookings());
    }

    // ==========================================
    // GET BOOKING BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<AdminBookingResponse> getBookingById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                adminBookingService.getBookingById(id));
    }

    // ==========================================
    // ASSIGN WORKER
    // ==========================================

    @PutMapping("/{id}/assign-worker")
    public ResponseEntity<AdminBookingResponse> assignWorker(
            @PathVariable Long id,
            @RequestBody AssignWorkerRequest request) {

        return ResponseEntity.ok(
                adminBookingService.assignWorker(
                        id,
                        request.getWorkerId()));
    }

    // ==========================================
    // UPDATE STATUS
    // ==========================================

    @PutMapping("/{id}/status")
    public ResponseEntity<AdminBookingResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateBookingStatusRequest request) {

        return ResponseEntity.ok(
                adminBookingService.updateStatus(
                        id,
                        request.getStatus()));
    }
}