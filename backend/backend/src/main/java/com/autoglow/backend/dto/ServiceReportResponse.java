package com.autoglow.backend.dto;

public class ServiceReportResponse {

    private String serviceName;
    private long bookingCount;
    private double revenue;
    private double averageRevenue;

    public ServiceReportResponse() {
    }

    public ServiceReportResponse(
            String serviceName,
            long bookingCount,
            double revenue,
            double averageRevenue) {

        this.serviceName = serviceName;
        this.bookingCount = bookingCount;
        this.revenue = revenue;
        this.averageRevenue = averageRevenue;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public long getBookingCount() {
        return bookingCount;
    }

    public void setBookingCount(long bookingCount) {
        this.bookingCount = bookingCount;
    }

    public double getRevenue() {
        return revenue;
    }

    public void setRevenue(double revenue) {
        this.revenue = revenue;
    }

    public double getAverageRevenue() {
        return averageRevenue;
    }

    public void setAverageRevenue(double averageRevenue) {
        this.averageRevenue = averageRevenue;
    }
}