package com.autoglow.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inspections")
public class Inspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false, unique = true)
    private Long bookingId;

    @Column(name = "exterior_condition")
    private String exteriorCondition;

    @Column(name = "interior_condition")
    private String interiorCondition;

    @Column(name = "tyre_condition")
    private String tyreCondition;

    @Column(name = "engine_condition")
    private String engineCondition;

    @Column(name = "damage_found")
    private String damageFound;

    @Column(name = "inspection_notes", columnDefinition = "TEXT")
    private String inspectionNotes;

    @Column(name = "inspected_by")
    private String inspectedBy;

    @Column(name = "inspection_date")
    private LocalDateTime inspectionDate;

    public Inspection() {
    }

    public Long getId() {
        return id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
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

    public String getInspectedBy() {
        return inspectedBy;
    }

    public void setInspectedBy(String inspectedBy) {
        this.inspectedBy = inspectedBy;
    }

    public LocalDateTime getInspectionDate() {
        return inspectionDate;
    }

    public void setInspectionDate(LocalDateTime inspectionDate) {
        this.inspectionDate = inspectionDate;
    }
}