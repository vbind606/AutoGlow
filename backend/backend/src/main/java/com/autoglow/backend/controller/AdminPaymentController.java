package com.autoglow.backend.controller;

import com.autoglow.backend.dto.AdminPaymentResponse;
import com.autoglow.backend.service.AdminPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminPaymentController {

    private final AdminPaymentService adminPaymentService;

    public AdminPaymentController(AdminPaymentService adminPaymentService) {
        this.adminPaymentService = adminPaymentService;
    }

    // =========================================================
    // GET ALL PAYMENTS
    // GET /api/admin/payments
    // =========================================================
    @GetMapping
    public ResponseEntity<List<AdminPaymentResponse>> getAllPayments() {

        return ResponseEntity.ok(
                adminPaymentService.getAllPayments());
    }

    // =========================================================
    // GET PAYMENT BY ID
    // GET /api/admin/payments/{id}
    //
    // Used by Admin Payment Details page
    // =========================================================
    @GetMapping("/{id}")
    public ResponseEntity<AdminPaymentResponse> getPaymentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                adminPaymentService.getPaymentById(id));
    }

    // =========================================================
    // GET PAYMENT BY BOOKING ID
    // GET /api/admin/payments/booking/{bookingId}
    // =========================================================
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<AdminPaymentResponse> getPaymentByBookingId(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(
                adminPaymentService.getPaymentByBookingId(bookingId));
    }

    // =========================================================
    // PAYMENT STATS
    // GET /api/admin/payments/stats
    // =========================================================
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPaymentStats() {

        Map<String, Object> stats = new HashMap<>();

        stats.put(
                "totalPayments",
                adminPaymentService.getTotalPayments());

        stats.put(
                "successfulPayments",
                adminPaymentService.getSuccessfulPayments());

        stats.put(
                "pendingPayments",
                adminPaymentService.getPendingPayments());

        stats.put(
                "totalRevenue",
                adminPaymentService.getTotalRevenue());

        return ResponseEntity.ok(stats);
    }
}