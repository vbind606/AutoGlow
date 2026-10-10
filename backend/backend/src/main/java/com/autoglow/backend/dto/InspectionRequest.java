package com.autoglow.backend.dto;

public class InspectionRequest {

    private String exteriorCondition;
    private String interiorCondition;
    private String tyreCondition;
    private String engineCondition;
    private String damageFound;
    private String inspectionNotes;

    public InspectionRequest() {
    }

    public String getExteriorCondition() {
        return exteriorCondition;
    }

    public void setExteriorCondition(String exteriorCondition) {
        this.exteriorCondition = exteriorCondition;
    }

    public String getInteriorCondition() {
        return interiorCondition;
    }

    public void setInteriorCondition(String interiorCondition) {
        this.interiorCondition = interiorCondition;
    }

    public String getTyreCondition() {
        return tyreCondition;
    }

    public void setTyreCondition(String tyreCondition) {
        this.tyreCondition = tyreCondition;
    }

    public String getEngineCondition() {
        return engineCondition;
    }

    public void setEngineCondition(String engineCondition) {
        this.engineCondition = engineCondition;
    }

    public String getDamageFound() {
        return damageFound;
    }

    public void setDamageFound(String damageFound) {
        this.damageFound = damageFound;
    }

    public String getInspectionNotes() {
        return inspectionNotes;
    }

    public void setInspectionNotes(String inspectionNotes) {
        this.inspectionNotes = inspectionNotes;
    }
}