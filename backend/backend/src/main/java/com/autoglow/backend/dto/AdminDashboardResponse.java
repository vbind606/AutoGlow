package com.autoglow.backend.dto;

import java.util.List;

public class AdminDashboardResponse {

    private long totalCustomers;
    private long totalVehicles;
    private long totalBookings;
    private long activeWorkers;

    private long pendingBookings;
    private long completedBookings;

    private double totalRevenue;

    private List<RecentBookingResponse> recentBookings;

    public AdminDashboardResponse() {
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

    public long getActiveWorkers() {
        return activeWorkers;
    }

    public void setActiveWorkers(long activeWorkers) {
        this.activeWorkers = activeWorkers;
    }

    public long getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(long pendingBookings) {
        this.pendingBookings = pendingBookings;
    }

    public long getCompletedBookings() {
        return completedBookings;
    }

    public void setCompletedBookings(long completedBookings) {
        this.completedBookings = completedBookings;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public List<RecentBookingResponse> getRecentBookings() {
        return recentBookings;
    }

    public void setRecentBookings(List<RecentBookingResponse> recentBookings) {
        this.recentBookings = recentBookings;
    }
}