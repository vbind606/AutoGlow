package com.autoglow.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class BookingRequest {

    private Long vehicleId;
    private Long serviceId;
    private Long packageId;

    private LocalDate bookingDate;
    private LocalTime bookingTime;

    private boolean pickupRequired;
    private boolean dropRequired;

    private String pickupAddress;
    private String dropAddress;

    private String notes;

    public BookingRequest() {
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public Long getPackageId() {
        return packageId;
    }

    public void setPackageId(Long packageId) {
        this.packageId = packageId;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}