package com.autoglow.backend.dto;

public class WashingRequest {

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
}