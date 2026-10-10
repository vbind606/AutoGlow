package com.autoglow.backend.service;

import com.autoglow.backend.dto.AdminCustomerDetailsResponse;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.Invoice;
import com.autoglow.backend.entity.Payment;
import com.autoglow.backend.entity.Review;
import com.autoglow.backend.entity.User;
import com.autoglow.backend.entity.Vehicle;
import com.autoglow.backend.repository.BookingRepository;
import com.autoglow.backend.repository.InvoiceRepository;
import com.autoglow.backend.repository.PaymentRepository;
import com.autoglow.backend.repository.ReviewRepository;
import com.autoglow.backend.repository.UserRepository;
import com.autoglow.backend.repository.VehicleRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminCustomerDetailsService {

        private final UserRepository userRepository;
        private final VehicleRepository vehicleRepository;
        private final BookingRepository bookingRepository;
        private final PaymentRepository paymentRepository;
        private final InvoiceRepository invoiceRepository;
        private final ReviewRepository reviewRepository;

        public AdminCustomerDetailsService(
                        UserRepository userRepository,
                        VehicleRepository vehicleRepository,
                        BookingRepository bookingRepository,
                        PaymentRepository paymentRepository,
                        InvoiceRepository invoiceRepository,
                        ReviewRepository reviewRepository) {

                this.userRepository = userRepository;
                this.vehicleRepository = vehicleRepository;
                this.bookingRepository = bookingRepository;
                this.paymentRepository = paymentRepository;
                this.invoiceRepository = invoiceRepository;
                this.reviewRepository = reviewRepository;
        }

        // =========================================================
        // GET CUSTOMER DETAILS
        // =========================================================

        public AdminCustomerDetailsResponse getCustomerDetails(Long customerId) {

                User customer = userRepository.findById(customerId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Customer not found with ID: " + customerId));

                // -----------------------------------------------------
                // ROLE CHECK
                // -----------------------------------------------------

                String role = customer.getRole() != null
                                ? customer.getRole().toString()
                                : "";

                if (!"CUSTOMER".equalsIgnoreCase(role)) {
                        throw new RuntimeException(
                                        "Selected user is not a customer");
                }

                // -----------------------------------------------------
                // VEHICLES
                // -----------------------------------------------------

                List<Vehicle> vehicles = vehicleRepository.findByUserOrderByIdDesc(customer);

                // -----------------------------------------------------
                // BOOKINGS
                // -----------------------------------------------------

                List<Booking> bookings = bookingRepository
                                .findByUserOrderByBookingDateDescBookingTimeDesc(
                                                customer);

                // -----------------------------------------------------
                // PAYMENTS
                // -----------------------------------------------------

                List<Payment> payments;

                if (bookings.isEmpty()) {
                        payments = List.of();
                } else {
                        payments = paymentRepository
                                        .findByBookingInOrderByCreatedAtDesc(
                                                        bookings);
                }

                // -----------------------------------------------------
                // INVOICES
                // -----------------------------------------------------

                List<Invoice> invoices = bookings.stream()
                                .map(Booking::getId)
                                .map(invoiceRepository::findByBookingId)
                                .filter(Optional::isPresent)
                                .map(Optional::get)
                                .collect(Collectors.toList());

                // -----------------------------------------------------
                // REVIEWS
                // -----------------------------------------------------

                List<Review> reviews = reviewRepository.findByUserOrderByCreatedAtDesc(
                                customer);

                // =====================================================
                // RESPONSE
                // =====================================================

                AdminCustomerDetailsResponse response = new AdminCustomerDetailsResponse();

                // -----------------------------------------------------
                // CUSTOMER BASIC INFORMATION
                // -----------------------------------------------------

                response.setId(customer.getId());
                response.setName(customer.getName());
                response.setEmail(customer.getEmail());
                response.setRole(role);

                // -----------------------------------------------------
                // COUNTS
                // -----------------------------------------------------

                response.setTotalVehicles(vehicles.size());
                response.setTotalBookings(bookings.size());
                response.setTotalPayments(payments.size());
                response.setTotalInvoices(invoices.size());
                response.setTotalReviews(reviews.size());

                // -----------------------------------------------------
                // TOTAL SPENT
                // -----------------------------------------------------

                double totalSpent = payments.stream()
                                .filter(payment -> payment.getStatus() != null
                                                &&
                                                ("SUCCESS".equalsIgnoreCase(
                                                                payment.getStatus())
                                                                ||
                                                                "PAID".equalsIgnoreCase(
                                                                                payment.getStatus())
                                                                ||
                                                                "COMPLETED".equalsIgnoreCase(
                                                                                payment.getStatus())))
                                .mapToDouble(payment -> payment.getAmount())
                                .sum();

                response.setTotalSpent(totalSpent);

                // =====================================================
                // VEHICLE RESPONSE
                // =====================================================

                response.setVehicles(
                                vehicles.stream()
                                                .map(vehicle -> new AdminCustomerDetailsResponse.VehicleResponse(
                                                                vehicle.getId(),
                                                                vehicle.getVehicleType(),
                                                                vehicle.getBrand(),
                                                                vehicle.getModel(),
                                                                vehicle.getRegistrationNumber(),
                                                                vehicle.getYear(),
                                                                vehicle.getColor()))
                                                .collect(Collectors.toList()));

                // =====================================================
                // BOOKING RESPONSE
                // =====================================================

                response.setBookings(
                                bookings.stream()
                                                .map(this::convertBooking)
                                                .collect(Collectors.toList()));

                // =====================================================
                // PAYMENT RESPONSE
                // =====================================================

                response.setPayments(
                                payments.stream()
                                                .map(payment -> new AdminCustomerDetailsResponse.PaymentResponse(
                                                                payment.getId(),

                                                                payment.getBooking() != null
                                                                                ? payment.getBooking().getId()
                                                                                : null,

                                                                payment.getAmount(),

                                                                payment.getStatus(),

                                                                payment.getPaymentMethod(),

                                                                payment.getTransactionId(),

                                                                payment.getPaymentDate(),

                                                                payment.getPaidAt()))
                                                .collect(Collectors.toList()));

                // =====================================================
                // INVOICE RESPONSE
                // =====================================================

                response.setInvoices(
                                invoices.stream()
                                                .map(invoice -> convertInvoice(
                                                                invoice,
                                                                payments))
                                                .collect(Collectors.toList()));

                // =====================================================
                // REVIEW RESPONSE
                // =====================================================

                response.setReviews(
                                reviews.stream()
                                                .map(review -> new AdminCustomerDetailsResponse.ReviewResponse(

                                                                review.getId(),

                                                                review.getBooking() != null
                                                                                ? review.getBooking().getId()
                                                                                : null,

                                                                review.getRating(),

                                                                review.getComment(),

                                                                review.getCreatedAt()))
                                                .collect(Collectors.toList()));

                return response;
        }

        // =========================================================
        // BOOKING CONVERTER
        // =========================================================

        private AdminCustomerDetailsResponse.BookingResponse convertBooking(Booking booking) {

                String vehicleName = "Vehicle";

                if (booking.getVehicle() != null) {

                        String brand = booking.getVehicle().getBrand();
                        String model = booking.getVehicle().getModel();

                        if (brand != null && model != null) {

                                vehicleName = brand + " " + model;

                        } else if (brand != null) {

                                vehicleName = brand;

                        } else if (model != null) {

                                vehicleName = model;

                        } else {

                                vehicleName = "Vehicle #" +
                                                booking.getVehicle().getId();
                        }
                }

                String registrationNumber = null;

                if (booking.getVehicle() != null) {
                        registrationNumber = booking.getVehicle()
                                        .getRegistrationNumber();
                }

                String serviceName = null;

                if (booking.getService() != null) {
                        serviceName = booking.getService().getName();
                }

                String packageName = null;

                if (booking.getServicePackage() != null) {
                        packageName = booking.getServicePackage().getName();
                }

                String status = null;

                if (booking.getStatus() != null) {
                        status = booking.getStatus().name();
                }

                return new AdminCustomerDetailsResponse.BookingResponse(

                                booking.getId(),

                                booking.getVehicle() != null
                                                ? booking.getVehicle().getId()
                                                : null,

                                vehicleName,

                                registrationNumber,

                                serviceName,

                                packageName,

                                booking.getBookingDate(),

                                booking.getBookingTime(),

                                booking.isPickupRequired(),

                                booking.isDropRequired(),

                                booking.getPickupAddress(),

                                booking.getDropAddress(),

                                booking.getTotalAmount(),

                                status,

                                booking.getNotes());
        }

        // =========================================================
        // INVOICE CONVERTER
        // =========================================================

        private AdminCustomerDetailsResponse.InvoiceResponse convertInvoice(
                        Invoice invoice,
                        List<Payment> payments) {

                Long bookingId = invoice.getBookingId();

                Payment relatedPayment = null;

                if (bookingId != null) {

                        relatedPayment = payments.stream()

                                        .filter(payment -> payment.getBooking() != null
                                                        &&
                                                        bookingId.equals(
                                                                        payment.getBooking().getId()))

                                        .findFirst()

                                        .orElse(null);
                }

                String transactionId = null;
                String paymentMethod = null;

                if (relatedPayment != null) {

                        transactionId = relatedPayment.getTransactionId();

                        paymentMethod = relatedPayment.getPaymentMethod();
                }

                // -----------------------------------------------------
                // DTO KE EXACT 12 FIELDS KE ACCORDING MAPPING
                // -----------------------------------------------------

                Double serviceAmount = invoice.getAmount() != null
                                ? invoice.getAmount().doubleValue()
                                : 0.0;

                /*
                 * Current Invoice entity me separate packageAmount,
                 * pickupDropAmount aur discountAmount fields nahi hain.
                 *
                 * Isliye DTO compatibility ke liye 0.0 use kiya gaya hai.
                 */

                Double packageAmount = 0.0;

                Double pickupDropAmount = 0.0;

                Double discountAmount = 0.0;

                Double totalAmount = invoice.getTotalAmount() != null
                                ? invoice.getTotalAmount().doubleValue()
                                : 0.0;

                String paymentStatus = invoice.getStatus();

                // -----------------------------------------------------
                // EXACT InvoiceResponse CONSTRUCTOR
                // -----------------------------------------------------

                return new AdminCustomerDetailsResponse.InvoiceResponse(

                                invoice.getId(),

                                invoice.getBookingId(),

                                invoice.getInvoiceNumber(),

                                serviceAmount,

                                packageAmount,

                                pickupDropAmount,

                                discountAmount,

                                totalAmount,

                                paymentStatus,

                                transactionId,

                                paymentMethod,

                                invoice.getInvoiceDate());
        }
}