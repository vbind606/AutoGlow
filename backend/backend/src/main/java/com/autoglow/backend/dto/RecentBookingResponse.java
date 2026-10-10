package com.autoglow.backend.dto;

public class RecentBookingResponse {

    private Long id;
    private String customerName;
    private String vehicleName;
    private String bookingDate;
    private String bookingTime;
    private String status;
    private Double totalAmount;

    public RecentBookingResponse() {
    }

    public RecentBookingResponse(
            Long id,
            String customerName,
            String vehicleName,
            String bookingDate,
            String bookingTime,
            String status,
            Double totalAmount) {
        this.id = id;
        this.customerName = customerName;
        this.vehicleName = vehicleName;
        this.bookingDate = bookingDate;
        this.bookingTime = bookingTime;
        this.status = status;
        this.totalAmount = totalAmount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public void setVehicleName(String vehicleName) {
        this.vehicleName = vehicleName;
    }

    public String getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(String bookingDate) {
        this.bookingDate = bookingDate;
    }

    public String getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(String bookingTime) {
        this.bookingTime = bookingTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }
}