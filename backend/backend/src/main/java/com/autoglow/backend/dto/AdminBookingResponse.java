package com.autoglow.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class AdminBookingResponse {

    private Long id;

    private Long customerId;
    private String customerName;
    private String customerEmail;

    private Long vehicleId;
    private String vehicleName;
    private String registrationNumber;

    private String serviceName;
    private String packageName;

    private LocalDate bookingDate;
    private LocalTime bookingTime;

    private boolean pickupRequired;
    private boolean dropRequired;

    private String pickupAddress;
    private String dropAddress;

    private Double totalAmount;

    private String status;
    private String notes;

    public AdminBookingResponse() {
    }

    public AdminBookingResponse(
            Long id,
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
            boolean pickupRequired,
            boolean dropRequired,
            String pickupAddress,
            String dropAddress,
            Double totalAmount,
            String status,
            String notes) {
        this.id = id;
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

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public void setVehicleName(String vehicleName) {
        this.vehicleName = vehicleName;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public LocalTime getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(LocalTime bookingTime) {
        this.bookingTime = bookingTime;
    }

    public boolean isPickupRequired() {
        return pickupRequired;
    }

    public void setPickupRequired(boolean pickupRequired) {
        this.pickupRequired = pickupRequired;
    }

    public boolean isDropRequired() {
        return dropRequired;
    }

    public void setDropRequired(boolean dropRequired) {
        this.dropRequired = dropRequired;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public String getDropAddress() {
        return dropAddress;
    }

    public void setDropAddress(String dropAddress) {
        this.dropAddress = dropAddress;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}