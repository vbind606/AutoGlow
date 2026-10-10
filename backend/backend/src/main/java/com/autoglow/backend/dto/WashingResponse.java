package com.autoglow.backend.dto;

import java.time.LocalDateTime;

public class WashingResponse {

    private Long id;
    private Long bookingId;

    private String washType;

    private boolean exteriorWash;
    private boolean interiorCleaning;
    private boolean foamWash;
    private boolean pressureWash;
    private boolean wheelCleaning;
    private boolean glassCleaning;
    private boolean vacuumCleaning;
    private boolean polishApplied;

    private String washingNotes;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

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

    public String getWashType() {
        return washType;
    }

    public void setWashType(String washType) {
        this.washType = washType;
    }

    public boolean isExteriorWash() {
        return exteriorWash;
    }

    public void setExteriorWash(boolean exteriorWash) {
        this.exteriorWash = exteriorWash;
    }

    public boolean isInteriorCleaning() {
        return interiorCleaning;
    }

    public void setInteriorCleaning(boolean interiorCleaning) {
        this.interiorCleaning = interiorCleaning;
    }

    public boolean isFoamWash() {
        return foamWash;
    }

    public void setFoamWash(boolean foamWash) {
        this.foamWash = foamWash;
    }

    public boolean isPressureWash() {
        return pressureWash;
    }

    public void setPressureWash(boolean pressureWash) {
        this.pressureWash = pressureWash;
    }

    public boolean isWheelCleaning() {
        return wheelCleaning;
    }

    public void setWheelCleaning(boolean wheelCleaning) {
        this.wheelCleaning = wheelCleaning;
    }

    public boolean isGlassCleaning() {
        return glassCleaning;
    }

    public void setGlassCleaning(boolean glassCleaning) {
        this.glassCleaning = glassCleaning;
    }

    public boolean isVacuumCleaning() {
        return vacuumCleaning;
    }

    public void setVacuumCleaning(boolean vacuumCleaning) {
        this.vacuumCleaning = vacuumCleaning;
    }

    public boolean isPolishApplied() {
        return polishApplied;
    }

    public void setPolishApplied(boolean polishApplied) {
        this.polishApplied = polishApplied;
    }

    public String getWashingNotes() {
        return washingNotes;
    }

    public void setWashingNotes(String washingNotes) {
        this.washingNotes = washingNotes;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}