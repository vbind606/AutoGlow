package com.autoglow.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class AdminCustomerDetailsResponse {

    // =========================================================
    // CUSTOMER
    // =========================================================

    private Long id;
    private String name;
    private String email;
    private String role;

    // =========================================================
    // SUMMARY
    // =========================================================

    private Integer totalVehicles;
    private Integer totalBookings;
    private Integer totalPayments;
    private Integer totalInvoices;
    private Integer totalReviews;
    private Double totalSpent;

    // =========================================================
    // DETAILS
    // =========================================================

    private List<VehicleResponse> vehicles;
    private List<BookingResponse> bookings;
    private List<PaymentResponse> payments;
    private List<InvoiceResponse> invoices;
    private List<ReviewResponse> reviews;

    public AdminCustomerDetailsResponse() {
    }

    // =========================================================
    // VEHICLE RESPONSE
    // =========================================================

    public static class VehicleResponse {

        private Long id;
        private String vehicleType;
        private String brand;
        private String model;
        private String registrationNumber;
        private Integer year;
        private String color;

        public VehicleResponse() {
        }

        public VehicleResponse(
                Long id,
                String vehicleType,
                String brand,
                String model,
                String registrationNumber,
                Integer year,
                String color) {
            this.id = id;
            this.vehicleType = vehicleType;
            this.brand = brand;
            this.model = model;
            this.registrationNumber = registrationNumber;
            this.year = year;
            this.color = color;
        }

        public Long getId() {
            return id;
        }

        public String getVehicleType() {
            return vehicleType;
        }

        public String getBrand() {
            return brand;
        }

        public String getModel() {
            return model;
        }

        public String getRegistrationNumber() {
            return registrationNumber;
        }

        public Integer getYear() {
            return year;
        }

        public String getColor() {
            return color;
        }
    }

    // =========================================================
    // BOOKING RESPONSE
    // =========================================================

    public static class BookingResponse {

        private Long id;
        private Long vehicleId;
        private String vehicleName;
        private String registrationNumber;

        private String serviceName;
        private String packageName;

        private LocalDate bookingDate;
        private LocalTime bookingTime;

        private Boolean pickupRequired;
        private Boolean dropRequired;

        private String pickupAddress;
        private String dropAddress;

        private Double totalAmount;
        private String status;
        private String notes;

        public BookingResponse() {
        }

        public BookingResponse(
                Long id,
                Long vehicleId,
                String vehicleName,
                String registrationNumber,
                String serviceName,
                String packageName,
                LocalDate bookingDate,
                LocalTime bookingTime,
                Boolean pickupRequired,
                Boolean dropRequired,
                String pickupAddress,
                String dropAddress,
                Double totalAmount,
                String status,
                String notes) {
            this.id = id;
            this.vehicleId = vehicleId;
            this.vehicleName = vehicleName;
            this.registrationNumber = registrationNumber;
            this.serviceName = serviceName;
            this.packageName = packageName;
            this.bookingDate = bookingDate;
            this.bookingTime = bookingTime;
            this.pickupRequired = pickupRequired;
            this.dropRequired = dropRequired;
            this.pickupAddress = pickupAddress;
            this.dropAddress = dropAddress;
            this.totalAmount = totalAmount;
            this.status = status;
            this.notes = notes;
        }

        public Long getId() {
            return id;
        }

        public Long getVehicleId() {
            return vehicleId;
        }

        public String getVehicleName() {
            return vehicleName;
        }

        public String getRegistrationNumber() {
            return registrationNumber;
        }

        public String getServiceName() {
            return serviceName;
        }

        public String getPackageName() {
            return packageName;
        }

        public LocalDate getBookingDate() {
            return bookingDate;
        }

        public LocalTime getBookingTime() {
            return bookingTime;
        }

        public Boolean getPickupRequired() {
            return pickupRequired;
        }

        public Boolean getDropRequired() {
            return dropRequired;
        }

        public String getPickupAddress() {
            return pickupAddress;
        }

        public String getDropAddress() {
            return dropAddress;
        }

        public Double getTotalAmount() {
            return totalAmount;
        }

        public String getStatus() {
            return status;
        }

        public String getNotes() {
            return notes;
        }
    }

    // =========================================================
    // PAYMENT RESPONSE
    // =========================================================

    public static class PaymentResponse {

        private Long id;
        private Long bookingId;
        private Double amount;
        private String status;
        private String paymentMethod;
        private String transactionId;
        private LocalDateTime paymentDate;
        private LocalDateTime paidAt;

        public PaymentResponse() {
        }

        public PaymentResponse(
                Long id,
                Long bookingId,
                Double amount,
                String status,
                String paymentMethod,
                String transactionId,
                LocalDateTime paymentDate,
                LocalDateTime paidAt) {
            this.id = id;
            this.bookingId = bookingId;
            this.amount = amount;
            this.status = status;
            this.paymentMethod = paymentMethod;
            this.transactionId = transactionId;
            this.paymentDate = paymentDate;
            this.paidAt = paidAt;
        }

        public Long getId() {
            return id;
        }

        public Long getBookingId() {
            return bookingId;
        }

        public Double getAmount() {
            return amount;
        }

        public String getStatus() {
            return status;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public String getTransactionId() {
            return transactionId;
        }

        public LocalDateTime getPaymentDate() {
            return paymentDate;
        }

        public LocalDateTime getPaidAt() {
            return paidAt;
        }
    }

    // =========================================================
    // INVOICE RESPONSE
    // =========================================================

    public static class InvoiceResponse {

        private Long id;
        private Long bookingId;
        private String invoiceNumber;

        private Double serviceAmount;
        private Double packageAmount;
        private Double pickupDropAmount;
        private Double discountAmount;
        private Double totalAmount;

        private String paymentStatus;
        private String transactionId;
        private String paymentMethod;

        private LocalDateTime generatedAt;

        public InvoiceResponse() {
        }

        public InvoiceResponse(
                Long id,
                Long bookingId,
                String invoiceNumber,
                Double serviceAmount,
                Double packageAmount,
                Double pickupDropAmount,
                Double discountAmount,
                Double totalAmount,
                String paymentStatus,
                String transactionId,
                String paymentMethod,
                LocalDateTime generatedAt) {
            this.id = id;
            this.bookingId = bookingId;
            this.invoiceNumber = invoiceNumber;
            this.serviceAmount = serviceAmount;
            this.packageAmount = packageAmount;
            this.pickupDropAmount = pickupDropAmount;
            this.discountAmount = discountAmount;
            this.totalAmount = totalAmount;
            this.paymentStatus = paymentStatus;
            this.transactionId = transactionId;
            this.paymentMethod = paymentMethod;
            this.generatedAt = generatedAt;
        }

        public Long getId() {
            return id;
        }

        public Long getBookingId() {
            return bookingId;
        }

        public String getInvoiceNumber() {
            return invoiceNumber;
        }

        public Double getServiceAmount() {
            return serviceAmount;
        }

        public Double getPackageAmount() {
            return packageAmount;
        }

        public Double getPickupDropAmount() {
            return pickupDropAmount;
        }

        public Double getDiscountAmount() {
            return discountAmount;
        }

        public Double getTotalAmount() {
            return totalAmount;
        }

        public String getPaymentStatus() {
            return paymentStatus;
        }

        public String getTransactionId() {
            return transactionId;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public LocalDateTime getGeneratedAt() {
            return generatedAt;
        }
    }

    // =========================================================
    // REVIEW RESPONSE
    // =========================================================

    public static class ReviewResponse {

        private Long id;
        private Long bookingId;
        private Integer rating;
        private String comment;
        private LocalDateTime createdAt;

        public ReviewResponse() {
        }

        public ReviewResponse(
                Long id,
                Long bookingId,
                Integer rating,
                String comment,
                LocalDateTime createdAt) {
            this.id = id;
            this.bookingId = bookingId;
            this.rating = rating;
            this.comment = comment;
            this.createdAt = createdAt;
        }

        public Long getId() {
            return id;
        }

        public Long getBookingId() {
            return bookingId;
        }

        public Integer getRating() {
            return rating;
        }

        public String getComment() {
            return comment;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }
    }

    // =========================================================
    // MAIN GETTERS / SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getTotalVehicles() {
        return totalVehicles;
    }

    public void setTotalVehicles(Integer totalVehicles) {
        this.totalVehicles = totalVehicles;
    }

    public Integer getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(Integer totalBookings) {
        this.totalBookings = totalBookings;
    }

    public Integer getTotalPayments() {
        return totalPayments;
    }

    public void setTotalPayments(Integer totalPayments) {
        this.totalPayments = totalPayments;
    }

    public Integer getTotalInvoices() {
        return totalInvoices;
    }

    public void setTotalInvoices(Integer totalInvoices) {
        this.totalInvoices = totalInvoices;
    }

    public Integer getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(Integer totalReviews) {
        this.totalReviews = totalReviews;
    }

    public Double getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(Double totalSpent) {
        this.totalSpent = totalSpent;
    }

    public List<VehicleResponse> getVehicles() {
        return vehicles;
    }

    public void setVehicles(List<VehicleResponse> vehicles) {
        this.vehicles = vehicles;
    }

    public List<BookingResponse> getBookings() {
        return bookings;
    }

    public void setBookings(List<BookingResponse> bookings) {
        this.bookings = bookings;
    }

    public List<PaymentResponse> getPayments() {
        return payments;
    }

    public void setPayments(List<PaymentResponse> payments) {
        this.payments = payments;
    }

    public List<InvoiceResponse> getInvoices() {
        return invoices;
    }

    public void setInvoices(List<InvoiceResponse> invoices) {
        this.invoices = invoices;
    }

    public List<ReviewResponse> getReviews() {
        return reviews;
    }

    public void setReviews(List<ReviewResponse> reviews) {
        this.reviews = reviews;
    }
}