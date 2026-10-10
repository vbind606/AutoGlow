package com.autoglow.backend.dto;

public class ServiceProgressRequest {

    // =========================================================
    // DRYING
    // =========================================================

    private String dryingMethod;

    private boolean bodyCompletelyDry;
    private boolean glassDry;
    private boolean wheelsDry;
    private boolean noWaterSpots;

    private boolean dryingCompleted;

    private String dryingNotes;

    // =========================================================
    // QUALITY CHECK
    // =========================================================

    private boolean exteriorChecked;
    private boolean interiorChecked;
    private boolean glassChecked;
    private boolean wheelsChecked;
    private boolean paintChecked;
    private boolean noVisibleDefects;

    private boolean qualityCheckCompleted;

    private String qualityNotes;

    // =========================================================
    // COMPLETED
    // =========================================================

    private boolean serviceCompleted;
    private boolean vehicleReady;

    private String completionNotes;

    // =========================================================
    // DELIVERY
    // =========================================================

    private boolean vehicleHandedOver;
    private boolean customerReceived;

    private String deliveryNotes;

    // =========================================================
    // DRYING GETTERS & SETTERS
    // =========================================================

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

    public boolean isDryingCompleted() {
        return dryingCompleted;
    }

    public void setDryingCompleted(boolean dryingCompleted) {
        this.dryingCompleted = dryingCompleted;
    }

    public String getDryingNotes() {
        return dryingNotes;
    }

    public void setDryingNotes(String dryingNotes) {
        this.dryingNotes = dryingNotes;
    }

    // =========================================================
    // QUALITY CHECK GETTERS & SETTERS
    // =========================================================

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

    public boolean isQualityCheckCompleted() {
        return qualityCheckCompleted;
    }

    public void setQualityCheckCompleted(boolean qualityCheckCompleted) {
        this.qualityCheckCompleted = qualityCheckCompleted;
    }

    public String getQualityNotes() {
        return qualityNotes;
    }

    public void setQualityNotes(String qualityNotes) {
        this.qualityNotes = qualityNotes;
    }

    // =========================================================
    // COMPLETED GETTERS & SETTERS
    // =========================================================

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

    // =========================================================
    // DELIVERY GETTERS & SETTERS
    // =========================================================

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
}