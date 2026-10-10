package com.autoglow.backend.dto;

import java.util.List;

public class AdminReportsResponse {

    private long totalCustomers;
    private long totalVehicles;
    private long totalBookings;
    private long completedBookings;
    private long pendingBookings;
    private long cancelledBookings;

    private double totalRevenue;
    private double pendingRevenue;
    private double paidRevenue;

    private long totalPayments;
    private long successfulPayments;
    private long pendingPayments;
    private long failedPayments;

    private List<MonthlyReportResponse> monthlyReports;
    private List<BookingStatusReportResponse> bookingStatusReports;
    private List<ServiceReportResponse> serviceReports;

    public AdminReportsResponse() {
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalVehicles() {
        return totalVehicles;
    }

    public void setTotalVehicles(long totalVehicles) {
        this.totalVehicles = totalVehicles;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getCompletedBookings() {
        return completedBookings;
    }

    public void setCompletedBookings(long completedBookings) {
        this.completedBookings = completedBookings;
    }

    public long getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(long pendingBookings) {
        this.pendingBookings = pendingBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public double getPendingRevenue() {
        return pendingRevenue;
    }

    public void setPendingRevenue(double pendingRevenue) {
        this.pendingRevenue = pendingRevenue;
    }

    public double getPaidRevenue() {
        return paidRevenue;
    }

    public void setPaidRevenue(double paidRevenue) {
        this.paidRevenue = paidRevenue;
    }

    public long getTotalPayments() {
        return totalPayments;
    }

    public void setTotalPayments(long totalPayments) {
        this.totalPayments = totalPayments;
    }

    public long getSuccessfulPayments() {
        return successfulPayments;
    }

    public void setSuccessfulPayments(long successfulPayments) {
        this.successfulPayments = successfulPayments;
    }

    public long getPendingPayments() {
        return pendingPayments;
    }

    public void setPendingPayments(long pendingPayments) {
        this.pendingPayments = pendingPayments;
    }

    public long getFailedPayments() {
        return failedPayments;
    }

    public void setFailedPayments(long failedPayments) {
        this.failedPayments = failedPayments;
    }

    public List<MonthlyReportResponse> getMonthlyReports() {
        return monthlyReports;
    }

    public void setMonthlyReports(List<MonthlyReportResponse> monthlyReports) {
        this.monthlyReports = monthlyReports;
    }

    public List<BookingStatusReportResponse> getBookingStatusReports() {
        return bookingStatusReports;
    }

    public void setBookingStatusReports(
            List<BookingStatusReportResponse> bookingStatusReports) {
        this.bookingStatusReports = bookingStatusReports;
    }

    public List<ServiceReportResponse> getServiceReports() {
        return serviceReports;
    }

    public void setServiceReports(List<ServiceReportResponse> serviceReports) {
        this.serviceReports = serviceReports;
    }
}