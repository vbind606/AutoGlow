package com.autoglow.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class AdminInvoiceResponse {

    // =========================================================
    // INVOICE
    // =========================================================

    private Long id;
    private String invoiceNumber;

    // =========================================================
    // BOOKING
    // =========================================================

    private Long bookingId;
    private LocalDate serviceDate;
    private LocalTime serviceTime;

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
    // AMOUNT
    // =========================================================

    private BigDecimal amount;
    private BigDecimal totalAmount;

    // =========================================================
    // INVOICE DATE
    // =========================================================

    private LocalDateTime invoiceDate;
    private LocalDateTime createdAt;

    // =========================================================
    // STATUS
    // =========================================================

    private String status;

    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public AdminInvoiceResponse() {
    }

    // =========================================================
    // FULL CONSTRUCTOR
    // =========================================================

    public AdminInvoiceResponse(
            Long id,
            String invoiceNumber,

            Long bookingId,
            LocalDate serviceDate,
            LocalTime serviceTime,

            Long customerId,
            String customerName,
            String customerEmail,

            Long vehicleId,
            String vehicleName,
            String registrationNumber,

            String serviceName,
            String packageName,

            BigDecimal amount,
            BigDecimal totalAmount,

            LocalDateTime invoiceDate,
            LocalDateTime createdAt,

            String status) {

        this.id = id;
        this.invoiceNumber = invoiceNumber;

        this.bookingId = bookingId;
        this.serviceDate = serviceDate;
        this.serviceTime = serviceTime;

        this.customerId = customerId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;

        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.registrationNumber = registrationNumber;

        this.serviceName = serviceName;
        this.packageName = packageName;

        this.amount = amount;
        this.totalAmount = totalAmount;

        this.invoiceDate = invoiceDate;
        this.createdAt = createdAt;

        this.status = status;
    }

    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public LocalDate getServiceDate() {
        return serviceDate;
    }

    public LocalTime getServiceTime() {
        return serviceTime;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
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

    public BigDecimal getAmount() {
        return amount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public LocalDateTime getInvoiceDate() {
        return invoiceDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getStatus() {
        return status;
    }

    // =========================================================
    // SETTERS
    // =========================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public void setServiceDate(LocalDate serviceDate) {
        this.serviceDate = serviceDate;
    }

    public void setServiceTime(LocalTime serviceTime) {
        this.serviceTime = serviceTime;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public void setVehicleName(String vehicleName) {
        this.vehicleName = vehicleName;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public void setInvoiceDate(LocalDateTime invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}