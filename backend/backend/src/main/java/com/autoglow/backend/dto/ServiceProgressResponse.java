package com.autoglow.backend.dto;

import java.time.LocalDateTime;

public class ServiceProgressResponse {

    private Long id;
    private Long bookingId;
    private String currentStatus;

    private String dryingMethod;
    private boolean bodyCompletelyDry;
    private boolean glassDry;
    private boolean wheelsDry;
    private boolean noWaterSpots;
    private String dryingNotes;

    private boolean exteriorChecked;
    private boolean interiorChecked;
    private boolean glassChecked;
    private boolean wheelsChecked;
    private boolean paintChecked;
    private boolean noVisibleDefects;
    private String qualityNotes;

    private boolean serviceCompleted;
    private boolean vehicleReady;
    private String completionNotes;

    private boolean vehicleHandedOver;
    private boolean customerReceived;
    private String deliveryNotes;

    private LocalDateTime dryingStartedAt;
    private LocalDateTime dryingCompletedAt;
    private LocalDateTime qualityCheckAt;
    private LocalDateTime completedAt;
    private LocalDateTime deliveredAt;

    // =========================================================
    // GETTERS & SETTERS
    // =========================================================

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

    public String getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(String currentStatus) {
        this.currentStatus = currentStatus;
    }

    public String getDryingMethod() {
        return dryingMethod;
    }

    public void setDryingMethod(String dryingMethod) {
        this.dryingMethod = dryingMethod;
    }

    public boolean isBodyCompletelyDry() {
        return bodyCompletelyDry;
    }

    public void setBodyCompletelyDry(boolean bodyCompletelyDry) {
        this.bodyCompletelyDry = bodyCompletelyDry;
    }

    public boolean isGlassDry() {
        return glassDry;
    }

    public void setGlassDry(boolean glassDry) {
        this.glassDry = glassDry;
    }

    public boolean isWheelsDry() {
        return wheelsDry;
    }

    public void setWheelsDry(boolean wheelsDry) {
        this.wheelsDry = wheelsDry;
    }

    public boolean isNoWaterSpots() {
        return noWaterSpots;
    }

    public void setNoWaterSpots(boolean noWaterSpots) {
        this.noWaterSpots = noWaterSpots;
    }

    public String getDryingNotes() {
        return dryingNotes;
    }

    public void setDryingNotes(String dryingNotes) {
        this.dryingNotes = dryingNotes;
    }

    public boolean isExteriorChecked() {
        return exteriorChecked;
    }

    public void setExteriorChecked(boolean exteriorChecked) {
        this.exteriorChecked = exteriorChecked;
    }

    public boolean isInteriorChecked() {
        return interiorChecked;
    }

    public void setInteriorChecked(boolean interiorChecked) {
        this.interiorChecked = interiorChecked;
    }

    public boolean isGlassChecked() {
        return glassChecked;
    }

    public void setGlassChecked(boolean glassChecked) {
        this.glassChecked = glassChecked;
    }

    public boolean isWheelsChecked() {
        return wheelsChecked;
    }

    public void setWheelsChecked(boolean wheelsChecked) {
        this.wheelsChecked = wheelsChecked;
    }

    public boolean isPaintChecked() {
        return paintChecked;
    }

    public void setPaintChecked(boolean paintChecked) {
        this.paintChecked = paintChecked;
    }

    public boolean isNoVisibleDefects() {
        return noVisibleDefects;
    }

    public void setNoVisibleDefects(boolean noVisibleDefects) {
        this.noVisibleDefects = noVisibleDefects;
    }

    public String getQualityNotes() {
        return qualityNotes;
    }

    public void setQualityNotes(String qualityNotes) {
        this.qualityNotes = qualityNotes;
    }

    public boolean isServiceCompleted() {
        return serviceCompleted;
    }

    public void setServiceCompleted(boolean serviceCompleted) {
        this.serviceCompleted = serviceCompleted;
    }

    public boolean isVehicleReady() {
        return vehicleReady;
    }

    public void setVehicleReady(boolean vehicleReady) {
        this.vehicleReady = vehicleReady;
    }

    public String getCompletionNotes() {
        return completionNotes;
    }

    public void setCompletionNotes(String completionNotes) {
        this.completionNotes = completionNotes;
    }

    public boolean isVehicleHandedOver() {
        return vehicleHandedOver;
    }

    public void setVehicleHandedOver(boolean vehicleHandedOver) {
        this.vehicleHandedOver = vehicleHandedOver;
    }

    public boolean isCustomerReceived() {
        return customerReceived;
    }

    public void setCustomerReceived(boolean customerReceived) {
        this.customerReceived = customerReceived;
    }

    public String getDeliveryNotes() {
        return deliveryNotes;
    }

    public void setDeliveryNotes(String deliveryNotes) {
        this.deliveryNotes = deliveryNotes;
    }

    public LocalDateTime getDryingStartedAt() {
        return dryingStartedAt;
    }

    public void setDryingStartedAt(LocalDateTime dryingStartedAt) {
        this.dryingStartedAt = dryingStartedAt;
    }

    public LocalDateTime getDryingCompletedAt() {
        return dryingCompletedAt;
    }

    public void setDryingCompletedAt(LocalDateTime dryingCompletedAt) {
        this.dryingCompletedAt = dryingCompletedAt;
    }

    public LocalDateTime getQualityCheckAt() {
        return qualityCheckAt;
    }

    public void setQualityCheckAt(LocalDateTime qualityCheckAt) {
        this.qualityCheckAt = qualityCheckAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }
}