package com.autoglow.backend.controller;

import com.autoglow.backend.dto.AdminInvoiceResponse;
import com.autoglow.backend.service.AdminInvoiceService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/invoices")
public class AdminInvoiceController {

    private final AdminInvoiceService adminInvoiceService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AdminInvoiceController(
            AdminInvoiceService adminInvoiceService) {

        this.adminInvoiceService = adminInvoiceService;
    }

    // =========================================================
    // GET ALL INVOICES
    // GET /api/admin/invoices
    // =========================================================

    @GetMapping
    public ResponseEntity<List<AdminInvoiceResponse>> getAllInvoices() {

        return ResponseEntity.ok(
                adminInvoiceService.getAllInvoices());
    }

    // =========================================================
    // GET INVOICE BY ID
    // GET /api/admin/invoices/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<AdminInvoiceResponse> getInvoice(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                adminInvoiceService.getInvoiceById(id));
    }

    // =========================================================
    // GET INVOICE BY BOOKING ID
    // GET /api/admin/invoices/booking/{bookingId}
    // =========================================================

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<AdminInvoiceResponse> getInvoiceByBookingId(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(
                adminInvoiceService.getInvoiceByBookingId(
                        bookingId));
    }
}