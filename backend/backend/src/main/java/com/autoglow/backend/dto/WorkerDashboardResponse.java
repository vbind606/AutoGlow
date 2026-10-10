package com.autoglow.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class WorkerDashboardResponse {

    // =========================================================
    // WORKER INFORMATION
    // =========================================================

    private Long workerId;
    private String workerName;
    private String workerEmail;
    private String workerPhone;
    private String specialization;
    private boolean active;

    // =========================================================
    // DASHBOARD STATISTICS
    // =========================================================

    private long totalAssigned;
    private long pendingJobs;
    private long inProgressJobs;
    private long completedJobs;
    private long cancelledJobs;

    // =========================================================
    // TODAY / UPCOMING / RECENT BOOKINGS
    // =========================================================

    private List<WorkerBookingResponse> todayJobs = new ArrayList<>();

    private List<WorkerBookingResponse> upcomingJobs = new ArrayList<>();

    private List<WorkerBookingResponse> recentJobs = new ArrayList<>();

    // =========================================================
    // CONSTRUCTORS
    // =========================================================

    public WorkerDashboardResponse() {
    }

    // =========================================================
    // GETTERS & SETTERS
    // =========================================================

    public Long getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }

    public String getWorkerName() {
        return workerName;
    }

    public void setWorkerName(String workerName) {
        this.workerName = workerName;
    }

    public String getWorkerEmail() {
        return workerEmail;
    }

    public void setWorkerEmail(String workerEmail) {
        this.workerEmail = workerEmail;
    }

    public String getWorkerPhone() {
        return workerPhone;
    }

    public void setWorkerPhone(String workerPhone) {
        this.workerPhone = workerPhone;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public long getTotalAssigned() {
        return totalAssigned;
    }

    public void setTotalAssigned(long totalAssigned) {
        this.totalAssigned = totalAssigned;
    }

    public long getPendingJobs() {
        return pendingJobs;
    }

    public void setPendingJobs(long pendingJobs) {
        this.pendingJobs = pendingJobs;
    }

    public long getInProgressJobs() {
        return inProgressJobs;
    }

    public void setInProgressJobs(long inProgressJobs) {
        this.inProgressJobs = inProgressJobs;
    }

    public long getCompletedJobs() {
        return completedJobs;
    }

    public void setCompletedJobs(long completedJobs) {
        this.completedJobs = completedJobs;
    }

    public long getCancelledJobs() {
        return cancelledJobs;
    }

    public void setCancelledJobs(long cancelledJobs) {
        this.cancelledJobs = cancelledJobs;
    }

    public List<WorkerBookingResponse> getTodayJobs() {
        return todayJobs;
    }

    public void setTodayJobs(List<WorkerBookingResponse> todayJobs) {
        this.todayJobs = todayJobs;
    }

    public List<WorkerBookingResponse> getUpcomingJobs() {
        return upcomingJobs;
    }

    public void setUpcomingJobs(List<WorkerBookingResponse> upcomingJobs) {
        this.upcomingJobs = upcomingJobs;
    }

    public List<WorkerBookingResponse> getRecentJobs() {
        return recentJobs;
    }

    public void setRecentJobs(List<WorkerBookingResponse> recentJobs) {
        this.recentJobs = recentJobs;
    }

    // =========================================================
    // INNER BOOKING RESPONSE
    // =========================================================

    public static class WorkerBookingResponse {

        private Long bookingId;

        private String customerName;
        private String customerEmail;
        private String customerPhone;

        private String vehicleNumber;
        private String vehicleType;
        private String vehicleBrand;
        private String vehicleModel;

        private String serviceName;
        private String packageName;

        private LocalDate bookingDate;
        private LocalTime bookingTime;

        private String status;

        private Double totalAmount;

        private boolean pickupRequired;
        private boolean dropRequired;

        private String pickupAddress;
        private String dropAddress;

        private String notes;

        // =====================================================
        // CONSTRUCTOR
        // =====================================================

        public WorkerBookingResponse() {
        }

        // =====================================================
        // GETTERS & SETTERS
        // =====================================================

        public Long getBookingId() {
            return bookingId;
        }

        public void setBookingId(Long bookingId) {
            this.bookingId = bookingId;
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

        public String getCustomerPhone() {
            return customerPhone;
        }

        public void setCustomerPhone(String customerPhone) {
            this.customerPhone = customerPhone;
        }

        public String getVehicleNumber() {
            return vehicleNumber;
        }

        public void setVehicleNumber(String vehicleNumber) {
            this.vehicleNumber = vehicleNumber;
        }

        public String getVehicleType() {
            return vehicleType;
        }

        public void setVehicleType(String vehicleType) {
            this.vehicleType = vehicleType;
        }

        public String getVehicleBrand() {
            return vehicleBrand;
        }

        public void setVehicleBrand(String vehicleBrand) {
            this.vehicleBrand = vehicleBrand;
        }

        public String getVehicleModel() {
            return vehicleModel;
        }

        public void setVehicleModel(String vehicleModel) {
            this.vehicleModel = vehicleModel;
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
}