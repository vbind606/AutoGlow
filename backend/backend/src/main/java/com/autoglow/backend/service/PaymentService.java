package com.autoglow.backend.service;

import com.autoglow.backend.dto.PaymentResponse;
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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

        private final PaymentRepository paymentRepository;
        private final BookingRepository bookingRepository;
        private final UserRepository userRepository;
        private final InvoiceRepository invoiceRepository;
        private final NotificationService notificationService;

        public PaymentService(
                        PaymentRepository paymentRepository,
                        BookingRepository bookingRepository,
                        UserRepository userRepository,
                        InvoiceRepository invoiceRepository,
                        NotificationService notificationService) {

                this.paymentRepository = paymentRepository;
                this.bookingRepository = bookingRepository;
                this.userRepository = userRepository;
                this.invoiceRepository = invoiceRepository;
                this.notificationService = notificationService;
        }

        // =========================================================
        // GET PAYMENT BY BOOKING
        // =========================================================

        public PaymentResponse getPaymentByBookingId(
                        Long bookingId,
                        String email) {

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Booking booking = bookingRepository
                                .findById(bookingId)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                verifyOwnership(booking, user);

                return paymentRepository
                                .findByBooking(booking)
                                .map(this::toResponse)
                                .orElse(null);
        }

        // =========================================================
        // CREATE DUMMY PAYMENT
        // =========================================================

        public PaymentResponse createDummyPayment(
                        Long bookingId,
                        String email,
                        String paymentMethod) {

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Booking booking = bookingRepository
                                .findById(bookingId)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                verifyOwnership(booking, user);

                // -----------------------------------------------------
                // Validate payment method
                // -----------------------------------------------------

                if (paymentMethod == null ||
                                paymentMethod.isBlank()) {

                        throw new RuntimeException(
                                        "Payment method is required");
                }

                paymentMethod = paymentMethod
                                .trim()
                                .toUpperCase();

                if (!paymentMethod.equals("UPI")
                                && !paymentMethod.equals("CARD")
                                && !paymentMethod.equals("CASH")) {

                        throw new RuntimeException(
                                        "Invalid payment method. Use UPI, CARD or CASH.");
                }

                // -----------------------------------------------------
                // Booking amount
                // -----------------------------------------------------

                double amount = booking.getTotalAmount() != null
                                ? booking.getTotalAmount()
                                : 0.0;

                if (amount <= 0) {

                        throw new RuntimeException(
                                        "Invalid booking amount");
                }

                // -----------------------------------------------------
                // Existing payment or new payment
                // -----------------------------------------------------

                Payment payment = paymentRepository
                                .findByBooking(booking)
                                .orElse(null);

                if (payment == null) {

                        payment = new Payment();
                        payment.setBooking(booking);
                }

                LocalDateTime now = LocalDateTime.now();

                // -----------------------------------------------------
                // Payment details
                // -----------------------------------------------------

                payment.setAmount(amount);

                payment.setPaymentMethod(
                                paymentMethod);

                payment.setStatus(
                                "SUCCESS");

                payment.setTransactionId(
                                generateTransactionId());

                payment.setPaidAt(now);

                if (payment.getCreatedAt() == null) {

                        payment.setCreatedAt(now);
                }

                payment.setPaymentDate(now);

                // -----------------------------------------------------
                // Save payment
                // -----------------------------------------------------

                Payment savedPayment = paymentRepository.save(payment);

                // -----------------------------------------------------
                // Create / Update Invoice
                // -----------------------------------------------------

                createOrUpdateInvoice(
                                booking,
                                savedPayment);

                // -----------------------------------------------------
                // Payment success notification
                // -----------------------------------------------------

                notificationService.createNotification(
                                user.getId(),
                                "Payment Successful",
                                "Your payment of ₹"
                                                + savedPayment.getAmount()
                                                + " for booking #"
                                                + booking.getId()
                                                + " was successful.",
                                "PAYMENT",
                                booking.getId());

                return toResponse(savedPayment);
        }

        // =========================================================
        // GET ALL MY PAYMENTS
        // =========================================================

        public List<PaymentResponse> getMyPayments(
                        String email) {

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<Booking> bookings = bookingRepository
                                .findByUserOrderByBookingDateDescBookingTimeDesc(
                                                user);

                return bookings.stream()
                                .map(paymentRepository::findByBooking)
                                .filter(java.util.Optional::isPresent)
                                .map(java.util.Optional::get)
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        // =========================================================
        // CREATE / UPDATE INVOICE
        // =========================================================

        private void createOrUpdateInvoice(
                        Booking booking,
                        Payment payment) {

                invoiceRepository
                                .findByBookingId(booking.getId())
                                .ifPresentOrElse(

                                                // =================================================
                                                // INVOICE ALREADY EXISTS
                                                // =================================================

                                                invoice -> {

                                                        invoice.setStatus("PAID");

                                                        invoice.setTotalAmount(
                                                                        payment.getAmount() != null
                                                                                        ? BigDecimal.valueOf(
                                                                                                        payment.getAmount())
                                                                                        : BigDecimal.ZERO);

                                                        invoiceRepository.save(invoice);
                                                },

                                                // =================================================
                                                // INVOICE DOES NOT EXIST
                                                // =================================================

                                                () -> {

                                                        Invoice invoice = new Invoice();

                                                        // ---------------------------------------------
                                                        // Invoice number
                                                        // ---------------------------------------------

                                                        invoice.setInvoiceNumber(
                                                                        generateInvoiceNumber(
                                                                                        booking.getId()));

                                                        // ---------------------------------------------
                                                        // Booking ID
                                                        // ---------------------------------------------

                                                        invoice.setBookingId(
                                                                        booking.getId());

                                                        // ---------------------------------------------
                                                        // Customer details
                                                        // ---------------------------------------------

                                                        if (booking.getUser() != null) {

                                                                invoice.setCustomerId(
                                                                                booking.getUser().getId());

                                                                invoice.setCustomerName(
                                                                                booking.getUser().getName());

                                                                invoice.setCustomerEmail(
                                                                                booking.getUser().getEmail());
                                                        }

                                                        // ---------------------------------------------
                                                        // Vehicle details
                                                        // ---------------------------------------------

                                                        if (booking.getVehicle() != null) {

                                                                invoice.setVehicleId(
                                                                                booking.getVehicle().getId());

                                                                String vehicleName = booking.getVehicle().getBrand()
                                                                                + " "
                                                                                + booking.getVehicle().getModel();

                                                                invoice.setVehicleName(
                                                                                vehicleName.trim());

                                                                invoice.setRegistrationNumber(
                                                                                booking.getVehicle()
                                                                                                .getRegistrationNumber());
                                                        }

                                                        // ---------------------------------------------
                                                        // Service details
                                                        // ---------------------------------------------

                                                        if (booking.getService() != null) {

                                                                invoice.setServiceName(
                                                                                booking.getService().getName());
                                                        }

                                                        // ---------------------------------------------
                                                        // Package details
                                                        // ---------------------------------------------

                                                        if (booking.getServicePackage() != null) {

                                                                invoice.setPackageName(
                                                                                booking.getServicePackage().getName());
                                                        }

                                                        // ---------------------------------------------
                                                        // Payment amount
                                                        // ---------------------------------------------

                                                        BigDecimal totalAmount = payment.getAmount() != null
                                                                        ? BigDecimal.valueOf(
                                                                                        payment.getAmount())
                                                                        : BigDecimal.ZERO;

                                                        invoice.setAmount(totalAmount);

                                                        invoice.setTotalAmount(
                                                                        totalAmount);

                                                        // ---------------------------------------------
                                                        // Invoice status
                                                        // ---------------------------------------------

                                                        invoice.setStatus("PAID");

                                                        // ---------------------------------------------
                                                        // Invoice date
                                                        // ---------------------------------------------

                                                        invoice.setInvoiceDate(
                                                                        LocalDateTime.now());

                                                        // ---------------------------------------------
                                                        // Save invoice
                                                        // ---------------------------------------------

                                                        invoiceRepository.save(invoice);
                                                });
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
        // GENERATE TRANSACTION ID
        // =========================================================

        private String generateTransactionId() {

                String randomPart = UUID.randomUUID()
                                .toString()
                                .replace("-", "")
                                .substring(0, 12)
                                .toUpperCase();

                return "AGTXN" + randomPart;
        }

        // =========================================================
        // VERIFY OWNERSHIP
        // =========================================================

        private void verifyOwnership(
                        Booking booking,
                        User user) {

                if (booking.getUser() == null
                                || booking.getUser().getId() == null
                                || user.getId() == null
                                || !booking.getUser()
                                                .getId()
                                                .equals(user.getId())) {

                        throw new RuntimeException(
                                        "You cannot access this payment");
                }
        }

        // =========================================================
        // PAYMENT RESPONSE
        // =========================================================

        private PaymentResponse toResponse(
                        Payment payment) {

                return new PaymentResponse(
                                payment.getId(),
                                payment.getBooking().getId(),
                                payment.getAmount(),
                                payment.getStatus(),
                                payment.getPaymentMethod(),
                                payment.getTransactionId(),
                                payment.getCreatedAt(),
                                payment.getPaidAt());
        }
}