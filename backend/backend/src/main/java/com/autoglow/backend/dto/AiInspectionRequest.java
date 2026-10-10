package com.autoglow.backend.dto;

public class AiInspectionRequest {

    private String overallCondition;
    private String exteriorCondition;
    private String interiorCondition;
    private String glassCondition;
    private String tyreCondition;

    private boolean damageDetected;
    private boolean scratchDetected;
    private boolean dentDetected;
    private boolean paintDamageDetected;
    private boolean glassDamageDetected;
    private boolean tyreDamageDetected;

    private String workerRemarks;
    private String preExistingDamage;

    private String aiDetectedIssues;
    private String aiRecommendations;
    private Double aiConfidenceScore;

    private boolean aiAnalysisCompleted;

    // ---------------- GETTERS / SETTERS ----------------

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

    public boolean isAiAnalysisCompleted() {
        return aiAnalysisCompleted;
    }

    public void setAiAnalysisCompleted(boolean aiAnalysisCompleted) {
        this.aiAnalysisCompleted = aiAnalysisCompleted;
    }
}