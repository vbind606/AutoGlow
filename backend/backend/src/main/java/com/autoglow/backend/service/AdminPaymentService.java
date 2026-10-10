package com.autoglow.backend.service;

import com.autoglow.backend.dto.AdminPaymentResponse;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.Payment;
import com.autoglow.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminPaymentService {

    private final PaymentRepository paymentRepository;

    public AdminPaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    // =========================================================
    // GET ALL PAYMENTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<AdminPaymentResponse> getAllPayments() {

        List<Payment> payments = paymentRepository.findAllByOrderByCreatedAtDesc();

        return payments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET PAYMENT BY ID
    // GET /api/admin/payments/{id}
    // =========================================================

    @Transactional(readOnly = true)
    public AdminPaymentResponse getPaymentById(Long paymentId) {

        if (paymentId == null) {
            throw new RuntimeException("Payment ID cannot be null");
        }

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException(
                        "Payment not found with ID: " + paymentId));

        return convertToResponse(payment);
    }

    // =========================================================
    // GET PAYMENT BY BOOKING ID
    // GET /api/admin/payments/booking/{bookingId}
    // =========================================================

    @Transactional(readOnly = true)
    public AdminPaymentResponse getPaymentByBookingId(Long bookingId) {

        if (bookingId == null) {
            throw new RuntimeException("Booking ID cannot be null");
        }

        Payment payment = paymentRepository.findAll()
                .stream()
                .filter(paymentItem -> paymentItem.getBooking() != null
                        && paymentItem.getBooking().getId() != null
                        && paymentItem.getBooking().getId()
                                .equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                        "Payment not found for booking: "
                                + bookingId));

        return convertToResponse(payment);
    }

    // =========================================================
    // TOTAL PAYMENTS
    // =========================================================

    @Transactional(readOnly = true)
    public long getTotalPayments() {

        return paymentRepository.count();
    }

    // =========================================================
    // SUCCESSFUL PAYMENTS
    // =========================================================

    @Transactional(readOnly = true)
    public long getSuccessfulPayments() {

        return paymentRepository.findAll()
                .stream()
                .filter(payment -> payment.getStatus() != null
                        && payment.getStatus()
                                .equalsIgnoreCase("SUCCESS"))
                .count();
    }

    // =========================================================
    // PENDING PAYMENTS
    // =========================================================

    @Transactional(readOnly = true)
    public long getPendingPayments() {

        return paymentRepository.findAll()
                .stream()
                .filter(payment -> payment.getStatus() != null
                        && payment.getStatus()
                                .equalsIgnoreCase("PENDING"))
                .count();
    }

    // =========================================================
    // TOTAL REVENUE
    // =========================================================

    @Transactional(readOnly = true)
    public Double getTotalRevenue() {

        Double amount = paymentRepository.sumAmountByStatus("SUCCESS");

        return amount == null ? 0.0 : amount;
    }

    // =========================================================
    // CONVERT PAYMENT → ADMIN PAYMENT RESPONSE
    // =========================================================

    private AdminPaymentResponse convertToResponse(Payment payment) {

        if (payment == null) {
            throw new RuntimeException("Payment cannot be null");
        }

        // ---------------------------------------------------------
        // BOOKING
        // ---------------------------------------------------------

        Booking booking = payment.getBooking();

        if (booking == null) {

            throw new RuntimeException(
                    "Booking not found for payment: "
                            + payment.getId());
        }

        // =========================================================
        // CUSTOMER DETAILS
        // =========================================================

        Long customerId = null;

        String customerName = "Unknown Customer";

        String customerEmail = "-";

        if (booking.getUser() != null) {

            customerId = booking.getUser().getId();

            if (booking.getUser().getName() != null
                    && !booking.getUser().getName().trim().isEmpty()) {

                customerName = booking.getUser().getName();
            }

            if (booking.getUser().getEmail() != null
                    && !booking.getUser().getEmail().trim().isEmpty()) {

                customerEmail = booking.getUser().getEmail();
            }
        }

        // =========================================================
        // VEHICLE DETAILS
        // =========================================================

        Long vehicleId = null;

        String vehicleName = "Unknown Vehicle";

        String registrationNumber = "-";

        if (booking.getVehicle() != null) {

            vehicleId = booking.getVehicle().getId();

            /*
             * Current project structure does not confirm a separate
             * vehicle-name field, so keep the existing safe fallback.
             */
            vehicleName = "Vehicle #" + booking.getVehicle().getId();

            if (booking.getVehicle().getRegistrationNumber() != null
                    && !booking.getVehicle()
                            .getRegistrationNumber()
                            .trim()
                            .isEmpty()) {

                registrationNumber = booking.getVehicle()
                        .getRegistrationNumber();
            }
        }

        // =========================================================
        // SERVICE DETAILS
        // =========================================================

        String serviceName = "No Service";

        if (booking.getService() != null
                && booking.getService().getName() != null
                && !booking.getService()
                        .getName()
                        .trim()
                        .isEmpty()) {

            serviceName = booking.getService().getName();
        }

        // =========================================================
        // PACKAGE DETAILS
        // =========================================================

        String packageName = "No Package";

        if (booking.getServicePackage() != null
                && booking.getServicePackage().getName() != null
                && !booking.getServicePackage()
                        .getName()
                        .trim()
                        .isEmpty()) {

            packageName = booking.getServicePackage().getName();
        }

        // =========================================================
        // BOOKING STATUS
        // =========================================================

        String bookingStatus = "UNKNOWN";

        if (booking.getStatus() != null) {

            bookingStatus = booking.getStatus().name();
        }

        // =========================================================
        // PAYMENT STATUS
        // =========================================================

        String paymentStatus = "UNKNOWN";

        if (payment.getStatus() != null) {

            paymentStatus = payment.getStatus().toUpperCase();
        }

        // =========================================================
        // PAYMENT METHOD
        // =========================================================

        String paymentMethod = "-";

        if (payment.getPaymentMethod() != null
                && !payment.getPaymentMethod()
                        .trim()
                        .isEmpty()) {

            paymentMethod = payment.getPaymentMethod();
        }

        // =========================================================
        // TRANSACTION ID
        // =========================================================

        String transactionId = "-";

        if (payment.getTransactionId() != null
                && !payment.getTransactionId()
                        .trim()
                        .isEmpty()) {

            transactionId = payment.getTransactionId();
        }

        // =========================================================
        // FINAL RESPONSE
        // =========================================================

        return new AdminPaymentResponse(

                // -------------------------------------------------
                // PAYMENT
                // -------------------------------------------------
                payment.getId(),

                // -------------------------------------------------
                // BOOKING
                // -------------------------------------------------
                booking.getId(),

                // -------------------------------------------------
                // CUSTOMER
                // -------------------------------------------------
                customerId,
                customerName,
                customerEmail,

                // -------------------------------------------------
                // VEHICLE
                // -------------------------------------------------
                vehicleId,
                vehicleName,
                registrationNumber,

                // -------------------------------------------------
                // SERVICE
                // -------------------------------------------------
                serviceName,
                packageName,

                // -------------------------------------------------
                // BOOKING DATE / TIME / STATUS
                // -------------------------------------------------
                booking.getBookingDate(),
                booking.getBookingTime(),
                bookingStatus,

                // -------------------------------------------------
                // PAYMENT DETAILS
                // -------------------------------------------------
                payment.getAmount(),
                paymentStatus,
                paymentMethod,
                transactionId,

                // -------------------------------------------------
                // PAYMENT DATES
                // -------------------------------------------------
                payment.getPaymentDate(),
                payment.getCreatedAt(),
                payment.getPaidAt());
    }
}