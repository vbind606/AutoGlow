package com.autoglow.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class AdminPaymentResponse {

    // =========================================================
    // PAYMENT ID
    // =========================================================

    private Long paymentId;

    // =========================================================
    // BOOKING
    // =========================================================

    private Long bookingId;

    // =========================================================
    // CUSTOMER
    // =========================================================

    private Long customerId;

    private String customerName;

    private String customerEmail;

    // =========================================================
    // VEHICLE
    // =========================================================

    private Long vehicleId;

    private String vehicleName;

    private String registrationNumber;

    // =========================================================
    // SERVICE
    // =========================================================

    private String serviceName;

    private String packageName;

    // =========================================================
    // BOOKING DETAILS
    // =========================================================

    private LocalDate bookingDate;

    private LocalTime bookingTime;

    private String bookingStatus;

    // =========================================================
    // PAYMENT DETAILS
    // =========================================================

    private Double amount;

    private String paymentStatus;

    private String paymentMethod;

    private String transactionId;

    // =========================================================
    // PAYMENT DATES
    // =========================================================

    private LocalDateTime paymentDate;

    private LocalDateTime createdAt;

    private LocalDateTime paidAt;

    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public AdminPaymentResponse() {
    }

    // =========================================================
    // FULL CONSTRUCTOR
    // =========================================================

    public AdminPaymentResponse(
            Long paymentId,
            Long bookingId,

            Long customerId,
            String customerName,
            String customerEmail,

            Long vehicleId,
            String vehicleName,
            String registrationNumber,

            String serviceName,
            String packageName,

            LocalDate bookingDate,
            LocalTime bookingTime,
            String bookingStatus,

            Double amount,
            String paymentStatus,
            String paymentMethod,
            String transactionId,

            LocalDateTime paymentDate,
            LocalDateTime createdAt,
            LocalDateTime paidAt) {

        this.paymentId = paymentId;

        this.bookingId = bookingId;

        this.customerId = customerId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;

        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.registrationNumber = registrationNumber;

        this.serviceName = serviceName;
        this.packageName = packageName;

        this.bookingDate = bookingDate;
        this.bookingTime = bookingTime;
        this.bookingStatus = bookingStatus;

        this.amount = amount;
        this.paymentStatus = paymentStatus;
        this.paymentMethod = paymentMethod;
        this.transactionId = transactionId;

        this.paymentDate = paymentDate;
        this.createdAt = createdAt;
        this.paidAt = paidAt;
    }

    // =========================================================
    // PAYMENT ID
    // =========================================================

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    // =========================================================
    // BOOKING ID
    // =========================================================

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    // =========================================================
    // CUSTOMER ID
    // =========================================================

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    // =========================================================
    // CUSTOMER NAME
    // =========================================================

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    // =========================================================
    // CUSTOMER EMAIL
    // =========================================================

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    // =========================================================
    // VEHICLE ID
    // =========================================================

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    // =========================================================
    // VEHICLE NAME
    // =========================================================

    public String getVehicleName() {
        return vehicleName;
    }

    public void setVehicleName(String vehicleName) {
        this.vehicleName = vehicleName;
    }

    // =========================================================
    // REGISTRATION NUMBER
    // =========================================================

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    // =========================================================
    // SERVICE NAME
    // =========================================================

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    // =========================================================
    // PACKAGE NAME
    // =========================================================

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    // =========================================================
    // BOOKING DATE
    // =========================================================

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    // =========================================================
    // BOOKING TIME
    // =========================================================

    public LocalTime getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(LocalTime bookingTime) {
        this.bookingTime = bookingTime;
    }

    // =========================================================
    // BOOKING STATUS
    // =========================================================

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    // =========================================================
    // AMOUNT
    // =========================================================

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    // =========================================================
    // PAYMENT STATUS
    // =========================================================

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    // =========================================================
    // PAYMENT METHOD
    // =========================================================

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    // =========================================================
    // TRANSACTION ID
    // =========================================================

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    // =========================================================
    // PAYMENT DATE
    // =========================================================

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    // =========================================================
    // CREATED AT
    // =========================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // =========================================================
    // PAID AT
    // =========================================================

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
}