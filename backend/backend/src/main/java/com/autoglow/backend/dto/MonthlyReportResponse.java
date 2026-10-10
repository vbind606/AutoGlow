package com.autoglow.backend.dto;

public class MonthlyReportResponse {

    private String month;
    private long bookings;
    private double revenue;

    public MonthlyReportResponse() {
    }

    public MonthlyReportResponse(String month, long bookings, double revenue) {
        this.month = month;
        this.bookings = bookings;
        this.revenue = revenue;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public long getBookings() {
        return bookings;
    }

    public void setBookings(long bookings) {
        this.bookings = bookings;
    }

    public double getRevenue() {
        return revenue;
    }

    public void setRevenue(double revenue) {
        this.revenue = revenue;
    }
}