package com.autoglow.backend.service;

import com.autoglow.backend.dto.AdminInvoiceResponse;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.Invoice;
import com.autoglow.backend.entity.Payment;
import com.autoglow.backend.repository.BookingRepository;
import com.autoglow.backend.repository.InvoiceRepository;
import com.autoglow.backend.repository.PaymentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AdminInvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public AdminInvoiceService(
            InvoiceRepository invoiceRepository,
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository) {

        this.invoiceRepository = invoiceRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }

    // =========================================================
    // GET ALL INVOICES
    // =========================================================

    @Transactional(readOnly = true)
    public List<AdminInvoiceResponse> getAllInvoices() {

        return invoiceRepository
                .findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // GET INVOICE BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public AdminInvoiceResponse getInvoiceById(Long id) {

        Invoice invoice = invoiceRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));

        return convertToResponse(invoice);
    }

    // =========================================================
    // GET INVOICE BY BOOKING ID
    // =========================================================

    @Transactional(readOnly = true)
    public AdminInvoiceResponse getInvoiceByBookingId(Long bookingId) {

        Invoice invoice = invoiceRepository
                .findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException(
                        "Invoice not found for booking: " + bookingId));

        return convertToResponse(invoice);
    }

    // =========================================================
    // CONVERT INVOICE → ADMIN RESPONSE
    // =========================================================

    private AdminInvoiceResponse convertToResponse(Invoice invoice) {

        // ---------------------------------------------------------
        // Default values from invoice snapshot
        // ---------------------------------------------------------

        Long bookingId = invoice.getBookingId();

        Long customerId = invoice.getCustomerId();
        String customerName = invoice.getCustomerName();
        String customerEmail = invoice.getCustomerEmail();

        Long vehicleId = invoice.getVehicleId();
        String vehicleName = invoice.getVehicleName();
        String registrationNumber = invoice.getRegistrationNumber();

        String serviceName = invoice.getServiceName();
        String packageName = invoice.getPackageName();

        java.time.LocalDate serviceDate = null;
        java.time.LocalTime serviceTime = null;

        // ---------------------------------------------------------
        // Get actual booking data
        // ---------------------------------------------------------

        Booking booking = null;

        if (bookingId != null) {

            booking = bookingRepository
                    .findById(bookingId)
                    .orElse(null);
        }

        if (booking != null) {

            // =====================================================
            // CUSTOMER
            // =====================================================

            if (booking.getUser() != null) {

                if (booking.getUser().getId() != null) {
                    customerId = booking.getUser().getId();
                }

                if (booking.getUser().getName() != null
                        && !booking.getUser().getName().isBlank()) {

                    customerName = booking.getUser().getName();
                }

                if (booking.getUser().getEmail() != null
                        && !booking.getUser().getEmail().isBlank()) {

                    customerEmail = booking.getUser().getEmail();
                }
            }

            // =====================================================
            // VEHICLE
            // =====================================================

            if (booking.getVehicle() != null) {

                if (booking.getVehicle().getId() != null) {
                    vehicleId = booking.getVehicle().getId();
                }

                String brand = booking.getVehicle().getBrand();
                String model = booking.getVehicle().getModel();

                StringBuilder vehicleBuilder = new StringBuilder();

                if (brand != null && !brand.isBlank()) {
                    vehicleBuilder.append(brand.trim());
                }

                if (model != null && !model.isBlank()) {

                    if (vehicleBuilder.length() > 0) {
                        vehicleBuilder.append(" ");
                    }

                    vehicleBuilder.append(model.trim());
                }

                if (vehicleBuilder.length() > 0) {
                    vehicleName = vehicleBuilder.toString();
                }

                if (booking.getVehicle().getRegistrationNumber() != null
                        && !booking.getVehicle()
                                .getRegistrationNumber()
                                .isBlank()) {

                    registrationNumber = booking.getVehicle().getRegistrationNumber();
                }
            }

            // =====================================================
            // SERVICE
            // =====================================================

            if (booking.getService() != null) {

                if (booking.getService().getName() != null
                        && !booking.getService().getName().isBlank()) {

                    serviceName = booking.getService().getName();
                }
            }

            // =====================================================
            // PACKAGE
            // =====================================================

            if (booking.getServicePackage() != null) {

                if (booking.getServicePackage().getName() != null
                        && !booking.getServicePackage()
                                .getName()
                                .isBlank()) {

                    packageName = booking.getServicePackage().getName();
                }

                // -------------------------------------------------
                // If package has an associated service and direct
                // booking service is not available
                // -------------------------------------------------

                if ((serviceName == null || serviceName.isBlank())
                        && booking.getServicePackage().getService() != null) {

                    if (booking.getServicePackage()
                            .getService()
                            .getName() != null
                            && !booking.getServicePackage()
                                    .getService()
                                    .getName()
                                    .isBlank()) {

                        serviceName = booking.getServicePackage()
                                .getService()
                                .getName();
                    }
                }
            }

            // =====================================================
            // SERVICE DATE
            // =====================================================

            serviceDate = booking.getBookingDate();

            // =====================================================
            // SERVICE TIME
            // =====================================================

            serviceTime = booking.getBookingTime();
        }

        // =========================================================
        // PAYMENT STATUS
        // =========================================================

        String calculatedStatus = calculateInvoiceStatus(
                booking,
                invoice);

        // =========================================================
        // AMOUNT
        // =========================================================

        BigDecimal amount = invoice.getAmount();

        if (amount == null) {
            amount = BigDecimal.ZERO;
        }

        BigDecimal totalAmount = invoice.getTotalAmount();

        if (totalAmount == null) {
            totalAmount = amount;
        }

        // =========================================================
        // RESPONSE
        // =========================================================

        return new AdminInvoiceResponse(

                // Invoice
                invoice.getId(),
                invoice.getInvoiceNumber(),

                // Booking
                bookingId,

                // Service date/time
                serviceDate,
                serviceTime,

                // Customer
                customerId,
                customerName,
                customerEmail,

                // Vehicle
                vehicleId,
                vehicleName,
                registrationNumber,

                // Service / Package
                serviceName,
                packageName,

                // Amount
                amount,
                totalAmount,

                // Invoice dates
                invoice.getInvoiceDate(),
                invoice.getCreatedAt(),

                // REAL PAYMENT STATUS
                calculatedStatus);
    }

    // =========================================================
    // CALCULATE INVOICE STATUS
    // =========================================================

    private String calculateInvoiceStatus(
            Booking booking,
            Invoice invoice) {

        // ---------------------------------------------------------
        // If booking is unavailable, use stored invoice status
        // ---------------------------------------------------------

        if (booking == null) {

            if (invoice.getStatus() != null
                    && !invoice.getStatus().isBlank()) {

                return invoice.getStatus().toUpperCase();
            }

            return "UNPAID";
        }

        // ---------------------------------------------------------
        // Find payment for this booking
        // ---------------------------------------------------------

        Payment payment = paymentRepository
                .findByBooking(booking)
                .orElse(null);

        // ---------------------------------------------------------
        // No payment
        // ---------------------------------------------------------

        if (payment == null) {
            return "UNPAID";
        }

        // ---------------------------------------------------------
        // Payment must be SUCCESS
        // ---------------------------------------------------------

        if (!"SUCCESS".equalsIgnoreCase(payment.getStatus())) {
            return "UNPAID";
        }

        // ---------------------------------------------------------
        // Paid amount
        // ---------------------------------------------------------

        BigDecimal paidAmount = payment.getAmount() != null
                ? BigDecimal.valueOf(payment.getAmount())
                : BigDecimal.ZERO;

        if (paidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return "UNPAID";
        }

        // ---------------------------------------------------------
        // Booking total
        // ---------------------------------------------------------

        BigDecimal bookingAmount = booking.getTotalAmount() != null
                ? BigDecimal.valueOf(booking.getTotalAmount())
                : BigDecimal.ZERO;

        // ---------------------------------------------------------
        // Full payment
        // ---------------------------------------------------------

        if (bookingAmount.compareTo(BigDecimal.ZERO) > 0
                && paidAmount.compareTo(bookingAmount) >= 0) {

            return "PAID";
        }

        // ---------------------------------------------------------
        // Partial payment
        // ---------------------------------------------------------

        if (bookingAmount.compareTo(BigDecimal.ZERO) > 0
                && paidAmount.compareTo(bookingAmount) < 0) {

            return "PARTIAL";
        }

        // ---------------------------------------------------------
        // If booking amount is unavailable but payment is SUCCESS
        // consider it paid.
        // ---------------------------------------------------------

        return "PAID";
    }
}