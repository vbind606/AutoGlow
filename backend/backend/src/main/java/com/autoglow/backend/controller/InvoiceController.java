package com.autoglow.backend.controller;

import com.autoglow.backend.dto.InvoiceResponse;
import com.autoglow.backend.service.InvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/invoices")
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(
            InvoiceService invoiceService) {

        this.invoiceService = invoiceService;
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<InvoiceResponse> getInvoice(
            @PathVariable Long bookingId,
            Authentication authentication) {

        String email = authentication.getName();

        InvoiceResponse response = invoiceService.getInvoiceByBookingId(
                bookingId,
                email);

        return ResponseEntity.ok(response);
    }
}