package com.autoglow.backend.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

@Service
public class AIInspectionAnalyzerService {

    // =========================================================
    // MAIN ANALYZER
    // =========================================================

    public AnalysisResult analyze(
            String imageUrl,
            String vehicleNumber,
            String vehicleType) {

        validateInput(
                imageUrl,
                vehicleNumber);

        /*
         * -----------------------------------------------------
         * CURRENT BASELINE ANALYSIS
         * -----------------------------------------------------
         *
         * Real computer vision model abhi connected nahi hai.
         *
         * Isliye hum fake damage findings generate nahi karenge.
         *
         * Jab actual Vision AI connect hoga, isi method ke andar
         * model call kiya jayega.
         */

        List<AnalysisFinding> findings = new ArrayList<>();

        String normalizedVehicleType = vehicleType == null ||
                vehicleType.trim().isEmpty()
                        ? "Vehicle"
                        : vehicleType.trim();

        String summary = normalizedVehicleType
                + " image uploaded successfully. "
                + "AI vision analysis is currently pending. "
                + "Manual inspection is recommended "
                + "until a vision model is connected.";

        String recommendations = "Perform visual inspection of the vehicle "
                + "exterior, paint, glass, wheels, tyres "
                + "and body panels.";

        return new AnalysisResult(
                100,
                summary,
                recommendations,
                findings,
                "PENDING_AI_MODEL");
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateInput(
            String imageUrl,
            String vehicleNumber) {

        if (vehicleNumber == null ||
                vehicleNumber.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Vehicle number is required");
        }

        if (imageUrl == null ||
                imageUrl.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Vehicle image is required");
        }
    }

    // =========================================================
    // ANALYSIS RESULT
    // =========================================================

    public class AnalysisResult {

        private final Integer overallScore;

        private final String summary;

        private final String recommendations;

        private final List<AnalysisFinding> findings;

        private final String analysisStatus;

        public AnalysisResult(
                Integer overallScore,
                String summary,
                String recommendations,
                List<AnalysisFinding> findings,
                String analysisStatus) {

            this.overallScore = overallScore;

            this.summary = summary;

            this.recommendations = recommendations;

            this.findings = findings == null
                    ? Collections.emptyList()
                    : Collections.unmodifiableList(
                            new ArrayList<>(findings));

            this.analysisStatus = analysisStatus;
        }

        // =====================================================
        // GETTERS
        // =====================================================

        public Integer getOverallScore() {

            return overallScore;
        }

        public String getSummary() {

            return summary;
        }

        public String getRecommendations() {

            return recommendations;
        }

        public List<AnalysisFinding> getFindings() {

            return findings;
        }

        public String getAnalysisStatus() {

            return analysisStatus;
        }
    }

    // =========================================================
    // ANALYSIS FINDING
    // =========================================================
    //
    // IMPORTANT:
    // This class is NOT static.
    //
    // Therefore it can directly use:
    // normalize()
    // normalizeSeverity()
    // normalizeConfidence()
    // normalizeCost()
    //
    // from the outer service.
    // =========================================================

    public class AnalysisFinding {

        private final String area;

        private final String issueType;

        private final String severity;

        private final Double confidence;

        private final String title;

        private final String description;

        private final String recommendedAction;

        private final Double estimatedCost;

        public AnalysisFinding(
                String area,
                String issueType,
                String severity,
                Double confidence,
                String title,
                String description,
                String recommendedAction,
                Double estimatedCost) {

            this.area = normalize(area);

            this.issueType = normalize(issueType);

            this.severity = normalizeSeverity(severity);

            this.confidence = normalizeConfidence(confidence);

            this.title = normalize(title);

            this.description = normalize(description);

            this.recommendedAction = normalize(recommendedAction);

            this.estimatedCost = normalizeCost(estimatedCost);
        }

        // =====================================================
        // GETTERS
        // =====================================================

        public String getArea() {

            return area;
        }

        public String getIssueType() {

            return issueType;
        }

        public String getSeverity() {

            return severity;
        }

        public Double getConfidence() {

            return confidence;
        }

        public String getTitle() {

            return title;
        }

        public String getDescription() {

            return description;
        }

        public String getRecommendedAction() {

            return recommendedAction;
        }

        public Double getEstimatedCost() {

            return estimatedCost;
        }
    }

    // =========================================================
    // NORMALIZE STRING
    // =========================================================

    private String normalize(
            String value) {

        if (value == null) {

            return null;
        }

        String result = value.trim();

        if (result.isEmpty()) {

            return null;
        }

        return result;
    }

    // =========================================================
    // NORMALIZE SEVERITY
    // =========================================================

    private String normalizeSeverity(
            String severity) {

        if (severity == null ||
                severity.trim().isEmpty()) {

            return "LOW";
        }

        String value = severity
                .trim()
                .toUpperCase(
                        Locale.ROOT);

        return switch (value) {

            case "LOW",
                    "MEDIUM",
                    "HIGH",
                    "CRITICAL" ->
                value;

            default -> "LOW";
        };
    }

    // =========================================================
    // NORMALIZE CONFIDENCE
    // =========================================================

    private Double normalizeConfidence(
            Double confidence) {

        if (confidence == null) {

            return 0.0;
        }

        if (confidence.isNaN() ||
                confidence.isInfinite()) {

            return 0.0;
        }

        return Math.max(
                0.0,
                Math.min(
                        100.0,
                        confidence));
    }

    // =========================================================
    // NORMALIZE COST
    // =========================================================

    private Double normalizeCost(
            Double cost) {

        if (cost == null) {

            return 0.0;
        }

        if (cost.isNaN() ||
                cost.isInfinite() ||
                cost < 0) {

            return 0.0;
        }

        return cost;
    }
}