package com.autoglow.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_vehicle_inspections")
public class AiVehicleInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // -----------------------------------------
    // BOOKING
    // -----------------------------------------

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    // -----------------------------------------
    // WORKER
    // -----------------------------------------

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id")
    private Worker worker;

    // -----------------------------------------
    // INSPECTION STATUS
    // -----------------------------------------

    @Column(nullable = false)
    private String inspectionStatus = "PENDING";

    /*
        PENDING
        IN_PROGRESS
        COMPLETED
    */

    // -----------------------------------------
    // AI STATUS
    // -----------------------------------------

    @Column(nullable = false)
    private boolean aiAnalysisCompleted = false;

    // -----------------------------------------
    // VEHICLE CONDITION
    // -----------------------------------------

    private String overallCondition;

    /*
        EXCELLENT
        GOOD
        FAIR
        POOR
    */

    private String exteriorCondition;

    private String interiorCondition;

    private String glassCondition;

    private String tyreCondition;

    // -----------------------------------------
    // DAMAGE DETECTION
    // -----------------------------------------

    private boolean damageDetected = false;

    private boolean scratchDetected = false;

    private boolean dentDetected = false;

    private boolean paintDamageDetected = false;

    private boolean glassDamageDetected = false;

    private boolean tyreDamageDetected = false;

    // -----------------------------------------
    // AI RESULT
    // -----------------------------------------

    @Column(length = 3000)
    private String aiDetectedIssues;

    @Column(length = 3000)
    private String aiRecommendations;

    private Double aiConfidenceScore;

    // -----------------------------------------
    // WORKER OBSERVATION
    // -----------------------------------------

    @Column(length = 3000)
    private String workerRemarks;

    // -----------------------------------------
    // CUSTOMER-RELATED DAMAGE
    // -----------------------------------------

    @Column(length = 3000)
    private String preExistingDamage;

    // -----------------------------------------
    // INSPECTION TIME
    // -----------------------------------------

    private LocalDateTime inspectionStartedAt;

    private LocalDateTime inspectionCompletedAt;

    // -----------------------------------------
    // REPORT
    // -----------------------------------------

    private String reportStatus = "NOT_GENERATED";

    /*
        NOT_GENERATED
        GENERATED
    */

    @Column(length = 5000)
    private String inspectionReport;

    // -----------------------------------------
    // CREATED / UPDATED
    // -----------------------------------------

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // -----------------------------------------
    // CONSTRUCTOR
    // -----------------------------------------

    public AiVehicleInspection() {
    }

    // -----------------------------------------
    // LIFECYCLE
    // -----------------------------------------

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }

    // -----------------------------------------
    // GETTERS / SETTERS
    // -----------------------------------------

    public Long getId() {
        return id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public Worker getWorker() {
        return worker;
    }

    public void setWorker(Worker worker) {
        this.worker = worker;
    }

    public String getInspectionStatus() {
        return inspectionStatus;
    }

    public void setInspectionStatus(String inspectionStatus) {
        this.inspectionStatus = inspectionStatus;
    }

    public boolean isAiAnalysisCompleted() {
        return aiAnalysisCompleted;
    }

    public void setAiAnalysisCompleted(boolean aiAnalysisCompleted) {
        this.aiAnalysisCompleted = aiAnalysisCompleted;
    }

    public String getOverallCondition() {
        return overallCondition;
    }

    public void setOverallCondition(String overallCondition) {
        this.overallCondition = overallCondition;
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

    public String getGlassCondition() {
        return glassCondition;
    }

    public void setGlassCondition(String glassCondition) {
        this.glassCondition = glassCondition;
    }

    public String getTyreCondition() {
        return tyreCondition;
    }

    public void setTyreCondition(String tyreCondition) {
        this.tyreCondition = tyreCondition;
    }

    public boolean isDamageDetected() {
        return damageDetected;
    }

    public void setDamageDetected(boolean damageDetected) {
        this.damageDetected = damageDetected;
    }

    public boolean isScratchDetected() {
        return scratchDetected;
    }

    public void setScratchDetected(boolean scratchDetected) {
        this.scratchDetected = scratchDetected;
    }

    public boolean isDentDetected() {
        return dentDetected;
    }

    public void setDentDetected(boolean dentDetected) {
        this.dentDetected = dentDetected;
    }

    public boolean isPaintDamageDetected() {
        return paintDamageDetected;
    }

    public void setPaintDamageDetected(boolean paintDamageDetected) {
        this.paintDamageDetected = paintDamageDetected;
    }

    public boolean isGlassDamageDetected() {
        return glassDamageDetected;
    }

    public void setGlassDamageDetected(boolean glassDamageDetected) {
        this.glassDamageDetected = glassDamageDetected;
    }

    public boolean isTyreDamageDetected() {
        return tyreDamageDetected;
    }

    public void setTyreDamageDetected(boolean tyreDamageDetected) {
        this.tyreDamageDetected = tyreDamageDetected;
    }

    public String getAiDetectedIssues() {
        return aiDetectedIssues;
    }

    public void setAiDetectedIssues(String aiDetectedIssues) {
        this.aiDetectedIssues = aiDetectedIssues;
    }

    public String getAiRecommendations() {
        return aiRecommendations;
    }

    public void setAiRecommendations(String aiRecommendations) {
        this.aiRecommendations = aiRecommendations;
    }

    public Double getAiConfidenceScore() {
        return aiConfidenceScore;
    }

    public void setAiConfidenceScore(Double aiConfidenceScore) {
        this.aiConfidenceScore = aiConfidenceScore;
    }

    public String getWorkerRemarks() {
        return workerRemarks;
    }

    public void setWorkerRemarks(String workerRemarks) {
        this.workerRemarks = workerRemarks;
    }

    public String getPreExistingDamage() {
        return preExistingDamage;
    }

    public void setPreExistingDamage(String preExistingDamage) {
        this.preExistingDamage = preExistingDamage;
    }

    public LocalDateTime getInspectionStartedAt() {
        return inspectionStartedAt;
    }

    public void setInspectionStartedAt(LocalDateTime inspectionStartedAt) {
        this.inspectionStartedAt = inspectionStartedAt;
    }

    public LocalDateTime getInspectionCompletedAt() {
        return inspectionCompletedAt;
    }

    public void setInspectionCompletedAt(LocalDateTime inspectionCompletedAt) {
        this.inspectionCompletedAt = inspectionCompletedAt;
    }

    public String getReportStatus() {
        return reportStatus;
    }

    public void setReportStatus(String reportStatus) {
        this.reportStatus = reportStatus;
    }

    public String getInspectionReport() {
        return inspectionReport;
    }

    public void setInspectionReport(String inspectionReport) {
        this.inspectionReport = inspectionReport;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}