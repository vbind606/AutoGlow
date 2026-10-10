package com.autoglow.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "worker_issues")
public class WorkerIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Booking / Service Job ID
    @Column(nullable = false)
    private Long bookingId;

    // Worker who reported the issue
    private Long workerId;

    // Vehicle number
    @Column(length = 50)
    private String vehicleNumber;

    // Issue category
    @Column(nullable = false, length = 100)
    private String category;

    // LOW / MEDIUM / HIGH / CRITICAL
    @Column(nullable = false, length = 30)
    private String severity;

    // Vehicle area where issue was found
    @Column(length = 100)
    private String vehicleArea;

    // Detailed issue description
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    // Uploaded issue photo path
    @Column(length = 500)
    private String photoPath;

    // Estimated repair/service cost
    private Double estimatedCost;

    // Recommended action by worker
    @Column(columnDefinition = "TEXT")
    private String recommendedAction;

    // OPEN / IN_PROGRESS / RESOLVED
    @Column(nullable = false, length = 30)
    private String status = "OPEN";

    // Created date/time
    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Updated date/time
    private LocalDateTime updatedAt;


    // =========================
    // PRE-PERSIST
    // =========================

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (status == null || status.isBlank()) {
            status = "OPEN";
        }

        updatedAt = now;
    }


    // =========================
    // PRE-UPDATE
    // =========================

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }


    // =========================
    // GETTERS & SETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }


    public Long getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }


    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }


    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }


    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }


    public String getVehicleArea() {
        return vehicleArea;
    }

    public void setVehicleArea(String vehicleArea) {
        this.vehicleArea = vehicleArea;
    }


    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public String getPhotoPath() {
        return photoPath;
    }

    public void setPhotoPath(String photoPath) {
        this.photoPath = photoPath;
    }


    public Double getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(Double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }


    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}