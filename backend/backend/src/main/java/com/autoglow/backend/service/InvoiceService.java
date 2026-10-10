package com.autoglow.backend.service;

import com.autoglow.backend.dto.InvoiceResponse;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.Invoice;
import com.autoglow.backend.entity.Payment;
import com.autoglow.backend.entity.User;
import com.autoglow.backend.repository.BookingRepository;
import com.autoglow.backend.repository.InvoiceRepository;
import com.autoglow.backend.repository.PaymentRepository;
import com.autoglow.backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

        private final InvoiceRepository invoiceRepository;
        private final BookingRepository bookingRepository;
        private final UserRepository userRepository;
        private final PaymentRepository paymentRepository;

        public InvoiceService(
                        InvoiceRepository invoiceRepository,
                        BookingRepository bookingRepository,
                        UserRepository userRepository,
                        PaymentRepository paymentRepository) {

                this.invoiceRepository = invoiceRepository;
                this.bookingRepository = bookingRepository;
                this.userRepository = userRepository;
                this.paymentRepository = paymentRepository;
        }

        // =========================================================
        // GET INVOICE BY BOOKING ID
        // =========================================================

        public InvoiceResponse getInvoiceByBookingId(
                        Long bookingId,
                        String email) {

                // -----------------------------------------------------
                // FIND USER
                // -----------------------------------------------------

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // -----------------------------------------------------
                // FIND BOOKING
                // -----------------------------------------------------

                Booking booking = bookingRepository
                                .findById(bookingId)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                // -----------------------------------------------------
                // VERIFY OWNERSHIP
                // -----------------------------------------------------

                if (booking.getUser() == null
                                || booking.getUser().getId() == null
                                || user.getId() == null
                                || !booking.getUser()
                                                .getId()
                                                .equals(user.getId())) {

                        throw new RuntimeException(
                                        "You cannot access another user's invoice");
                }

                // -----------------------------------------------------
                // FIND EXISTING INVOICE
                // OR GENERATE NEW INVOICE
                // -----------------------------------------------------

                Invoice invoice = invoiceRepository
                                .findByBookingId(bookingId)
                                .orElseGet(() -> generateInvoice(booking));

                // -----------------------------------------------------
                // FIND PAYMENT
                // -----------------------------------------------------

                Payment payment = paymentRepository
                                .findByBooking(booking)
                                .orElse(null);

                // -----------------------------------------------------
                // UPDATE INVOICE AFTER PAYMENT
                // -----------------------------------------------------

                if (payment != null) {

                        String paymentStatus = payment.getStatus();

                        if (paymentStatus != null
                                        && (paymentStatus.equalsIgnoreCase("SUCCESS")
                                                        || paymentStatus.equalsIgnoreCase("PAID")
                                                        || paymentStatus.equalsIgnoreCase("COMPLETED"))) {

                                invoice.setStatus("PAID");

                                // -------------------------------------------------
                                // Payment amount -> Invoice amount
                                // Payment amount = Double
                                // Invoice amount = BigDecimal
                                // -------------------------------------------------

                                if (payment.getAmount() != null) {

                                        BigDecimal paymentAmount = BigDecimal.valueOf(
                                                        payment.getAmount());

                                        invoice.setAmount(
                                                        paymentAmount);

                                        invoice.setTotalAmount(
                                                        paymentAmount);
                                }

                                invoice = invoiceRepository.save(
                                                invoice);
                        }
                }

                // -----------------------------------------------------
                // BUILD RESPONSE
                // -----------------------------------------------------

                return buildResponse(
                                invoice,
                                payment);
        }

        // =========================================================
        // GENERATE NEW INVOICE
        // =========================================================

        private Invoice generateInvoice(
                        Booking booking) {

                Invoice invoice = new Invoice();

                // -----------------------------------------------------
                // INVOICE NUMBER
                // -----------------------------------------------------

                invoice.setInvoiceNumber(
                                generateInvoiceNumber(
                                                booking.getId()));

                // -----------------------------------------------------
                // BOOKING ID
                // -----------------------------------------------------

                invoice.setBookingId(
                                booking.getId());

                // -----------------------------------------------------
                // CUSTOMER DETAILS
                // -----------------------------------------------------

                if (booking.getUser() != null) {

                        invoice.setCustomerId(
                                        booking.getUser().getId());

                        invoice.setCustomerName(
                                        booking.getUser().getName());

                        invoice.setCustomerEmail(
                                        booking.getUser().getEmail());
                }

                // -----------------------------------------------------
                // VEHICLE DETAILS
                // -----------------------------------------------------

                if (booking.getVehicle() != null) {

                        invoice.setVehicleId(
                                        booking.getVehicle().getId());

                        String brand = booking.getVehicle().getBrand();

                        String model = booking.getVehicle().getModel();

                        String vehicleName = "";

                        if (brand != null) {
                                vehicleName = brand;
                        }

                        if (model != null) {

                                if (!vehicleName.isBlank()) {
                                        vehicleName += " ";
                                }

                                vehicleName += model;
                        }

                        invoice.setVehicleName(
                                        vehicleName);

                        invoice.setRegistrationNumber(
                                        booking.getVehicle()
                                                        .getRegistrationNumber());
                }

                // -----------------------------------------------------
                // SERVICE DETAILS
                // -----------------------------------------------------

                if (booking.getService() != null) {

                        invoice.setServiceName(
                                        booking.getService()
                                                        .getName());
                }

                // -----------------------------------------------------
                // PACKAGE DETAILS
                // -----------------------------------------------------

                if (booking.getServicePackage() != null) {

                        invoice.setPackageName(
                                        booking.getServicePackage()
                                                        .getName());
                }

                // -----------------------------------------------------
                // TOTAL AMOUNT
                // -----------------------------------------------------

                BigDecimal totalAmount = BigDecimal.ZERO;

                if (booking.getTotalAmount() != null) {

                        totalAmount = BigDecimal.valueOf(
                                        booking.getTotalAmount());
                }

                invoice.setAmount(
                                totalAmount);

                invoice.setTotalAmount(
                                totalAmount);

                // -----------------------------------------------------
                // STATUS
                // -----------------------------------------------------

                invoice.setStatus(
                                "UNPAID");

                // -----------------------------------------------------
                // DATES
                // -----------------------------------------------------

                LocalDateTime now = LocalDateTime.now();

                invoice.setInvoiceDate(
                                now);

                invoice.setCreatedAt(
                                now);

                // -----------------------------------------------------
                // SAVE INVOICE
                // -----------------------------------------------------

                return invoiceRepository.save(
                                invoice);
        }

        // =========================================================
        // GENERATE INVOICE NUMBER
        // =========================================================

        private String generateInvoiceNumber(
                        Long bookingId) {

                String date = LocalDateTime.now()
                                .format(
                                                DateTimeFormatter.ofPattern(
                                                                "yyyyMMdd"));

                return String.format(
                                "AG-%s-%06d",
                                date,
                                bookingId);
        }

        // =========================================================
        // BUILD RESPONSE
        // =========================================================

        private InvoiceResponse buildResponse(
                        Invoice invoice,
                        Payment payment) {

                InvoiceResponse response = new InvoiceResponse();

                // -----------------------------------------------------
                // BASIC INVOICE DETAILS
                // -----------------------------------------------------

                response.setId(
                                invoice.getId());

                response.setInvoiceNumber(
                                invoice.getInvoiceNumber());

                response.setBookingId(
                                invoice.getBookingId());

                // -----------------------------------------------------
                // AMOUNT
                // Invoice BigDecimal -> Response Double
                // -----------------------------------------------------

                response.setTotalAmount(
                                invoice.getTotalAmount() != null
                                                ? invoice.getTotalAmount()
                                                                .doubleValue()
                                                : 0.0);

                // -----------------------------------------------------
                // PAYMENT STATUS
                // -----------------------------------------------------

                response.setPaymentStatus(
                                invoice.getStatus());

                // -----------------------------------------------------
                // INVOICE DATE
                // -----------------------------------------------------

                response.setGeneratedAt(
                                invoice.getInvoiceDate());

                // -----------------------------------------------------
                // CUSTOMER
                // -----------------------------------------------------

                response.setCustomerName(
                                invoice.getCustomerName());

                response.setCustomerEmail(
                                invoice.getCustomerEmail());

                // -----------------------------------------------------
                // VEHICLE
                // -----------------------------------------------------

                response.setVehicleMake(
                                invoice.getVehicleName());

                response.setVehicleNumber(
                                invoice.getRegistrationNumber());

                // -----------------------------------------------------
                // SERVICE
                // -----------------------------------------------------

                response.setServiceName(
                                invoice.getServiceName());

                // -----------------------------------------------------
                // PACKAGE
                // -----------------------------------------------------

                response.setPackageName(
                                invoice.getPackageName());

                // -----------------------------------------------------
                // PAYMENT DETAILS
                // -----------------------------------------------------

                if (payment != null) {

                        response.setPaymentMethod(
                                        payment.getPaymentMethod());

                        response.setTransactionId(
                                        payment.getTransactionId());
                }

                return response;
        }
}