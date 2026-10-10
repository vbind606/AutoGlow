package com.autoglow.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_checklists")
public class ServiceChecklist {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // BOOKING INFORMATION
    // =========================================================

    @Column(nullable = false)
    private Long bookingId;

    // =========================================================
    // WORKER INFORMATION
    // =========================================================

    private Long workerId;

    // =========================================================
    // CHECKLIST ITEMS
    // =========================================================

    private Boolean exteriorWash = false;

    private Boolean interiorCleaning = false;

    private Boolean foamWash = false;

    private Boolean pressureWash = false;

    private Boolean tyreCleaning = false;

    private Boolean wheelCleaning = false;

    private Boolean dashboardCleaning = false;

    private Boolean vacuumCleaning = false;

    private Boolean glassCleaning = false;

    private Boolean engineCleaning = false;

    private Boolean polishing = false;

    private Boolean waxing = false;

    private Boolean finalInspection = false;

    // =========================================================
    // BEFORE / AFTER PHOTOS
    // =========================================================

    private String beforePhotoPath;

    private String afterPhotoPath;

    // =========================================================
    // CHECKLIST STATUS
    // =========================================================

    @Column(length = 30)
    private String status = "IN_PROGRESS";

    // =========================================================
    // TIMESTAMPS
    // =========================================================

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // =========================================================
    // PRE PERSIST
    // =========================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null || status.isBlank()) {
            status = "IN_PROGRESS";
        }
    }

    // =========================================================
    // PRE UPDATE
    // =========================================================

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // =========================================================
    // GETTERS & SETTERS
    // =========================================================

    public Long getId() {
        return id;
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

    public Boolean getExteriorWash() {
        return exteriorWash;
    }

    public void setExteriorWash(Boolean exteriorWash) {
        this.exteriorWash = exteriorWash;
    }

    public Boolean getInteriorCleaning() {
        return interiorCleaning;
    }

    public void setInteriorCleaning(Boolean interiorCleaning) {
        this.interiorCleaning = interiorCleaning;
    }

    public Boolean getFoamWash() {
        return foamWash;
    }

    public void setFoamWash(Boolean foamWash) {
        this.foamWash = foamWash;
    }

    public Boolean getPressureWash() {
        return pressureWash;
    }

    public void setPressureWash(Boolean pressureWash) {
        this.pressureWash = pressureWash;
    }

    public Boolean getTyreCleaning() {
        return tyreCleaning;
    }

    public void setTyreCleaning(Boolean tyreCleaning) {
        this.tyreCleaning = tyreCleaning;
    }

    public Boolean getWheelCleaning() {
        return wheelCleaning;
    }

    public void setWheelCleaning(Boolean wheelCleaning) {
        this.wheelCleaning = wheelCleaning;
    }

    public Boolean getDashboardCleaning() {
        return dashboardCleaning;
    }

    public void setDashboardCleaning(Boolean dashboardCleaning) {
        this.dashboardCleaning = dashboardCleaning;
    }

    public Boolean getVacuumCleaning() {
        return vacuumCleaning;
    }

    public void setVacuumCleaning(Boolean vacuumCleaning) {
        this.vacuumCleaning = vacuumCleaning;
    }

    public Boolean getGlassCleaning() {
        return glassCleaning;
    }

    public void setGlassCleaning(Boolean glassCleaning) {
        this.glassCleaning = glassCleaning;
    }

    public Boolean getEngineCleaning() {
        return engineCleaning;
    }

    public void setEngineCleaning(Boolean engineCleaning) {
        this.engineCleaning = engineCleaning;
    }

    public Boolean getPolishing() {
        return polishing;
    }

    public void setPolishing(Boolean polishing) {
        this.polishing = polishing;
    }

    public Boolean getWaxing() {
        return waxing;
    }

    public void setWaxing(Boolean waxing) {
        this.waxing = waxing;
    }

    public Boolean getFinalInspection() {
        return finalInspection;
    }

    public void setFinalInspection(Boolean finalInspection) {
        this.finalInspection = finalInspection;
    }

    public String getBeforePhotoPath() {
        return beforePhotoPath;
    }

    public void setBeforePhotoPath(String beforePhotoPath) {
        this.beforePhotoPath = beforePhotoPath;
    }

    public String getAfterPhotoPath() {
        return afterPhotoPath;
    }

    public void setAfterPhotoPath(String afterPhotoPath) {
        this.afterPhotoPath = afterPhotoPath;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}