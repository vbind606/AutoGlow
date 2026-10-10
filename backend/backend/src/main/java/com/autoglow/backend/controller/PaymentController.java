package com.autoglow.backend.controller;

import com.autoglow.backend.dto.PaymentResponse;
import com.autoglow.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // =========================================================
    // GET PAYMENT BY BOOKING ID
    // =========================================================

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentResponse> getPaymentByBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {

        String email = authentication.getName();

        PaymentResponse response =
                paymentService.getPaymentByBookingId(
                        bookingId,
                        email);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // DUMMY PAYMENT CHECKOUT
    // =========================================================

    @PostMapping("/{bookingId}")
    public ResponseEntity<PaymentResponse> makePayment(
            @PathVariable Long bookingId,
            @RequestParam String paymentMethod,
            Authentication authentication) {

        String email = authentication.getName();

        /*
         * IMPORTANT:
         *
         * PaymentService method order:
         *
         * createDummyPayment(
         *      bookingId,
         *      email,
         *      paymentMethod
         * )
         */

        PaymentResponse response =
                paymentService.createDummyPayment(
                        bookingId,
                        email,
                        paymentMethod);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // CUSTOMER PAYMENT HISTORY
    // =========================================================

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getMyPayments(
            Authentication authentication) {

        String email = authentication.getName();

        List<PaymentResponse> payments =
                paymentService.getMyPayments(email);

        return ResponseEntity.ok(payments);
    }
}