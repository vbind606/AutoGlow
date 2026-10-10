package com.autoglow.backend.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class AIInspectionResponse {

    // =========================================================
    // INSPECTION INFORMATION
    // =========================================================

    private Long id;

    private String vehicleNumber;

    private String vehicleType;

    private String imageUrl;

    private Integer overallScore;

    private Integer findingCount;

    private Integer highSeverityCount;

    private Double averageConfidence;

    /*
     * Possible values:
     *
     * PENDING
     * PROCESSING
     * COMPLETED
     * FAILED
     */
    private String status;

    private String summary;

    private String recommendations;

    private String errorMessage;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // =========================================================
    // FINDINGS
    // =========================================================

    private List<AIInspectionFindingResponse> findings = new ArrayList<>();

    // =========================================================
    // CONSTRUCTORS
    // =========================================================

    public AIInspectionResponse() {
    }

    // =========================================================
    // GETTERS & SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Integer overallScore) {
        this.overallScore = overallScore;
    }

    public Integer getFindingCount() {
        return findingCount;
    }

    public void setFindingCount(Integer findingCount) {
        this.findingCount = findingCount;
    }

    public Integer getHighSeverityCount() {
        return highSeverityCount;
    }

    public void setHighSeverityCount(Integer highSeverityCount) {
        this.highSeverityCount = highSeverityCount;
    }

    public Double getAverageConfidence() {
        return averageConfidence;
    }

    public void setAverageConfidence(Double averageConfidence) {
        this.averageConfidence = averageConfidence;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(String recommendations) {
        this.recommendations = recommendations;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
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

    public List<AIInspectionFindingResponse> getFindings() {
        return findings;
    }

    public void setFindings(List<AIInspectionFindingResponse> findings) {
        this.findings = findings == null
                ? new ArrayList<>()
                : findings;
    }
}