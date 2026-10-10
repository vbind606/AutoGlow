package com.autoglow.backend.service;

import com.autoglow.backend.dto.AIInspectionFindingResponse;
import com.autoglow.backend.dto.AIInspectionResponse;
import com.autoglow.backend.entity.AIInspection;
import com.autoglow.backend.entity.AIInspectionFinding;
import com.autoglow.backend.repository.AIInspectionFindingRepository;
import com.autoglow.backend.repository.AIInspectionRepository;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminAIInspectionService {

    private final AIInspectionRepository inspectionRepository;
    private final AIInspectionFindingRepository findingRepository;
    private final AIInspectionAnalyzerService analyzerService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AdminAIInspectionService(
            AIInspectionRepository inspectionRepository,
            AIInspectionFindingRepository findingRepository,
            AIInspectionAnalyzerService analyzerService) {
        this.inspectionRepository = inspectionRepository;
        this.findingRepository = findingRepository;
        this.analyzerService = analyzerService;
    }

    // =========================================================
    // GET ALL INSPECTIONS
    // =========================================================

    public List<AIInspectionResponse> getAllInspections() {

        return inspectionRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET INSPECTION BY ID
    // =========================================================

    public AIInspectionResponse getInspectionById(Long id) {

        AIInspection inspection = findInspection(id);

        return mapToResponse(inspection);
    }

    // =========================================================
    // SEARCH BY VEHICLE NUMBER
    // =========================================================

    public List<AIInspectionResponse> searchByVehicleNumber(
            String vehicleNumber) {

        if (vehicleNumber == null || vehicleNumber.trim().isEmpty()) {
            return new ArrayList<>();
        }

        return inspectionRepository
                .findByVehicleNumberContainingIgnoreCaseOrderByCreatedAtDesc(
                        vehicleNumber.trim())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET VEHICLE INSPECTION HISTORY
    // =========================================================

    public List<AIInspectionResponse> getByVehicleNumber(
            String vehicleNumber) {

        if (vehicleNumber == null || vehicleNumber.trim().isEmpty()) {
            return new ArrayList<>();
        }

        return inspectionRepository
                .findByVehicleNumberIgnoreCaseOrderByCreatedAtDesc(
                        vehicleNumber.trim())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET BY STATUS
    // =========================================================

    public List<AIInspectionResponse> getByStatus(
            String status) {

        if (status == null || status.trim().isEmpty()) {
            return new ArrayList<>();
        }

        return inspectionRepository
                .findByStatusIgnoreCaseOrderByCreatedAtDesc(
                        status.trim())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // CREATE INSPECTION
    // =========================================================

    public AIInspectionResponse createInspection(
            String vehicleNumber,
            String vehicleType,
            String imageUrl) {

        if (vehicleNumber == null || vehicleNumber.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Vehicle number is required.");
        }

        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Inspection image is required.");
        }

        AIInspection inspection = new AIInspection();

        inspection.setVehicleNumber(
                vehicleNumber.trim().toUpperCase());

        inspection.setVehicleType(
                normalize(vehicleType));

        inspection.setImageUrl(
                imageUrl.trim());

        inspection.setStatus("PENDING");

        inspection.setOverallScore(0);

        inspection.setFindingCount(0);

        inspection.setHighSeverityCount(0);

        inspection.setAverageConfidence(0.0);

        inspection.setSummary(
                "Inspection created and waiting for processing.");

        inspection.setRecommendations(
                "Start inspection processing to generate findings.");

        inspection.setCreatedAt(
                LocalDateTime.now());

        inspection.setUpdatedAt(
                LocalDateTime.now());

        AIInspection saved = inspectionRepository.save(inspection);

        return mapToResponse(saved);
    }

    // =========================================================
    // PROCESS INSPECTION
    // =========================================================

    public AIInspectionResponse processInspection(Long id) {

        AIInspection inspection = findInspection(id);

        // -----------------------------------------------------
        // MARK PROCESSING
        // -----------------------------------------------------

        inspection.setStatus("PROCESSING");
        inspection.setUpdatedAt(LocalDateTime.now());

        inspectionRepository.save(inspection);

        try {

            // -------------------------------------------------
            // RUN ANALYZER
            // -------------------------------------------------

            AIInspectionAnalyzerService.AnalysisResult result = analyzerService.analyze(
                    inspection.getImageUrl(),
                    inspection.getVehicleNumber(),
                    inspection.getVehicleType());

            // -------------------------------------------------
            // DELETE OLD FINDINGS
            // -------------------------------------------------

            findingRepository.deleteByInspectionId(
                    inspection.getId());

            // -------------------------------------------------
            // SAVE NEW FINDINGS
            // -------------------------------------------------

            if (result.getFindings() != null) {

                for (AIInspectionAnalyzerService.AnalysisFinding analyzedFinding : result.getFindings()) {

                    AIInspectionFinding finding = new AIInspectionFinding();

                    finding.setInspection(inspection);

                    finding.setArea(
                            analyzedFinding.getArea());

                    finding.setIssueType(
                            analyzedFinding.getIssueType());

                    finding.setSeverity(
                            analyzedFinding.getSeverity());

                    finding.setConfidence(
                            analyzedFinding.getConfidence());

                    finding.setTitle(
                            analyzedFinding.getTitle());

                    finding.setDescription(
                            analyzedFinding.getDescription());

                    finding.setRecommendedAction(
                            analyzedFinding.getRecommendedAction());

                    finding.setEstimatedCost(
                            analyzedFinding.getEstimatedCost());

                    finding.setReviewed(false);

                    findingRepository.save(finding);
                }
            }

            // -------------------------------------------------
            // UPDATE INSPECTION RESULT
            // -------------------------------------------------

            inspection.setOverallScore(
                    result.getOverallScore());

            inspection.setSummary(
                    result.getSummary());

            inspection.setRecommendations(
                    result.getRecommendations());

            // -------------------------------------------------
            // CURRENT ANALYZER RESULT
            // -------------------------------------------------
            // The current analyzer is a safe placeholder until
            // a real AI vision provider is connected.

            inspection.setStatus("COMPLETED");

            inspection.setUpdatedAt(
                    LocalDateTime.now());

            updateInspectionStatistics(inspection);

            AIInspection saved = inspectionRepository.save(inspection);

            return mapToResponse(saved);

        } catch (Exception ex) {

            inspection.setStatus("FAILED");

            inspection.setErrorMessage(
                    safeMessage(ex));

            inspection.setUpdatedAt(
                    LocalDateTime.now());

            inspectionRepository.save(inspection);

            throw new RuntimeException(
                    "AI inspection processing failed: "
                            + safeMessage(ex),
                    ex);
        }
    }

    // =========================================================
    // MARK AS PROCESSING
    // =========================================================

    public AIInspectionResponse markAsProcessing(Long id) {

        AIInspection inspection = findInspection(id);

        inspection.setStatus("PROCESSING");

        inspection.setUpdatedAt(
                LocalDateTime.now());

        AIInspection saved = inspectionRepository.save(inspection);

        return mapToResponse(saved);
    }

    // =========================================================
    // COMPLETE INSPECTION MANUALLY
    // =========================================================

    public AIInspectionResponse completeInspection(
            Long id,
            String summary,
            String recommendations) {

        AIInspection inspection = findInspection(id);

        if (summary != null && !summary.trim().isEmpty()) {

            inspection.setSummary(
                    summary.trim());
        }

        if (recommendations != null
                && !recommendations.trim().isEmpty()) {

            inspection.setRecommendations(
                    recommendations.trim());
        }

        inspection.setStatus("COMPLETED");

        inspection.setErrorMessage(null);

        inspection.setUpdatedAt(
                LocalDateTime.now());

        updateInspectionStatistics(inspection);

        AIInspection saved = inspectionRepository.save(inspection);

        return mapToResponse(saved);
    }

    // =========================================================
    // MARK AS FAILED
    // =========================================================

    public AIInspectionResponse markAsFailed(
            Long id,
            String errorMessage) {

        AIInspection inspection = findInspection(id);

        inspection.setStatus("FAILED");

        inspection.setErrorMessage(
                normalize(errorMessage));

        inspection.setUpdatedAt(
                LocalDateTime.now());

        AIInspection saved = inspectionRepository.save(inspection);

        return mapToResponse(saved);
    }

    // =========================================================
    // GET FINDINGS
    // =========================================================

    public List<AIInspectionFindingResponse> getFindings(
            Long inspectionId) {

        findInspection(inspectionId);

        return findingRepository
                .findByInspectionIdOrderByCreatedAtAsc(
                        inspectionId)
                .stream()
                .map(this::mapFindingToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET FINDINGS BY SEVERITY
    // =========================================================

    public List<AIInspectionFindingResponse> getFindingsBySeverity(
            Long inspectionId,
            String severity) {

        findInspection(inspectionId);

        if (severity == null || severity.trim().isEmpty()) {
            return new ArrayList<>();
        }

        return findingRepository
                .findByInspectionIdAndSeverityIgnoreCaseOrderByCreatedAtAsc(
                        inspectionId,
                        severity.trim())
                .stream()
                .map(this::mapFindingToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // ADD MANUAL FINDING
    // =========================================================

    public AIInspectionFindingResponse addFinding(
            Long inspectionId,
            String area,
            String issueType,
            String severity,
            Double confidence,
            String title,
            String description,
            String recommendedAction,
            Double estimatedCost) {

        AIInspection inspection = findInspection(inspectionId);

        AIInspectionFinding finding = new AIInspectionFinding();

        finding.setInspection(inspection);

        finding.setArea(
                normalize(area));

        finding.setIssueType(
                normalize(issueType));

        finding.setSeverity(
                normalizeSeverity(severity));

        finding.setConfidence(
                normalizeConfidence(confidence));

        finding.setTitle(
                normalize(title));

        finding.setDescription(
                normalize(description));

        finding.setRecommendedAction(
                normalize(recommendedAction));

        finding.setEstimatedCost(
                normalizeCost(estimatedCost));

        finding.setReviewed(false);

        AIInspectionFinding saved = findingRepository.save(finding);

        updateInspectionStatistics(inspection);

        inspectionRepository.save(inspection);

        return mapFindingToResponse(saved);
    }

    // =========================================================
    // MARK FINDING REVIEWED
    // =========================================================

    public AIInspectionFindingResponse markFindingReviewed(
            Long findingId) {

        AIInspectionFinding finding = findingRepository.findById(findingId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Inspection finding not found: "
                                        + findingId));

        finding.setReviewed(true);

        AIInspectionFinding saved = findingRepository.save(finding);

        return mapFindingToResponse(saved);
    }

    // =========================================================
    // DELETE FINDING
    // =========================================================

    public void deleteFinding(Long findingId) {

        AIInspectionFinding finding = findingRepository.findById(findingId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Inspection finding not found: "
                                        + findingId));

        AIInspection inspection = finding.getInspection();

        findingRepository.delete(finding);

        if (inspection != null) {

            updateInspectionStatistics(inspection);

            inspectionRepository.save(inspection);
        }
    }

    // =========================================================
    // DELETE INSPECTION
    // =========================================================

    public void deleteInspection(Long id) {

        AIInspection inspection = findInspection(id);

        // Delete child findings first
        findingRepository.deleteByInspectionId(id);

        inspectionRepository.delete(inspection);
    }

    // =========================================================
    // UPDATE STATISTICS
    // =========================================================

    private void updateInspectionStatistics(
            AIInspection inspection) {

        Long inspectionId = inspection.getId();

        if (inspectionId == null) {
            return;
        }

        List<AIInspectionFinding> findings = findingRepository
                .findByInspectionIdOrderByCreatedAtAsc(
                        inspectionId);

        int findingCount = findings.size();

        int highSeverityCount = 0;

        double confidenceTotal = 0.0;

        int confidenceCount = 0;

        int penalty = 0;

        for (AIInspectionFinding finding : findings) {

            String severity = normalizeSeverity(
                    finding.getSeverity());

            // -------------------------------------------------
            // HIGH / CRITICAL COUNT
            // -------------------------------------------------

            if ("HIGH".equals(severity)
                    || "CRITICAL".equals(severity)) {

                highSeverityCount++;
            }

            // -------------------------------------------------
            // CONFIDENCE
            // -------------------------------------------------

            if (finding.getConfidence() != null) {

                confidenceTotal += finding.getConfidence();

                confidenceCount++;
            }

            // -------------------------------------------------
            // SCORE PENALTY
            // -------------------------------------------------

            switch (severity) {

                case "LOW":
                    penalty += 5;
                    break;

                case "MEDIUM":
                    penalty += 12;
                    break;

                case "HIGH":
                    penalty += 22;
                    break;

                case "CRITICAL":
                    penalty += 35;
                    break;

                default:
                    break;
            }
        }

        int overallScore;

        if (findings.isEmpty()) {

            overallScore = 100;

        } else {

            overallScore = Math.max(
                    0,
                    Math.min(
                            100,
                            100 - penalty));
        }

        double averageConfidence;

        if (confidenceCount == 0) {

            averageConfidence = 0.0;

        } else {

            averageConfidence = confidenceTotal / confidenceCount;
        }

        inspection.setFindingCount(
                findingCount);

        inspection.setHighSeverityCount(
                highSeverityCount);

        inspection.setAverageConfidence(
                Math.round(
                        averageConfidence * 100.0) / 100.0);

        inspection.setOverallScore(
                overallScore);

        inspection.setUpdatedAt(
                LocalDateTime.now());
    }

    // =========================================================
    // FIND INSPECTION
    // =========================================================

    private AIInspection findInspection(Long id) {

        if (id == null) {

            throw new IllegalArgumentException(
                    "Inspection ID is required.");
        }

        return inspectionRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "AI inspection not found: "
                                        + id));
    }

    // =========================================================
    // MAP INSPECTION TO RESPONSE
    // =========================================================

    private AIInspectionResponse mapToResponse(
            AIInspection inspection) {

        AIInspectionResponse response = new AIInspectionResponse();

        response.setId(
                inspection.getId());

        response.setVehicleNumber(
                inspection.getVehicleNumber());

        response.setVehicleType(
                inspection.getVehicleType());

        response.setImageUrl(
                inspection.getImageUrl());

        response.setOverallScore(
                inspection.getOverallScore());

        response.setFindingCount(
                inspection.getFindingCount());

        response.setHighSeverityCount(
                inspection.getHighSeverityCount());

        response.setAverageConfidence(
                inspection.getAverageConfidence());

        response.setStatus(
                inspection.getStatus());

        response.setSummary(
                inspection.getSummary());

        response.setRecommendations(
                inspection.getRecommendations());

        response.setErrorMessage(
                inspection.getErrorMessage());

        response.setCreatedAt(
                inspection.getCreatedAt());

        response.setUpdatedAt(
                inspection.getUpdatedAt());

        List<AIInspectionFindingResponse> findings = findingRepository
                .findByInspectionIdOrderByCreatedAtAsc(
                        inspection.getId())
                .stream()
                .map(this::mapFindingToResponse)
                .collect(Collectors.toList());

        response.setFindings(findings);

        return response;
    }

    // =========================================================
    // MAP FINDING TO RESPONSE
    // =========================================================

    private AIInspectionFindingResponse mapFindingToResponse(
            AIInspectionFinding finding) {

        AIInspectionFindingResponse response = new AIInspectionFindingResponse();

        response.setId(
                finding.getId());

        response.setArea(
                finding.getArea());

        response.setIssueType(
                finding.getIssueType());

        response.setSeverity(
                finding.getSeverity());

        response.setConfidence(
                finding.getConfidence());

        response.setTitle(
                finding.getTitle());

        response.setDescription(
                finding.getDescription());

        response.setRecommendedAction(
                finding.getRecommendedAction());

        response.setEstimatedCost(
                finding.getEstimatedCost());

        response.setReviewed(
                finding.getReviewed());

        return response;
    }

    // =========================================================
    // NORMALIZE STRING
    // =========================================================

    private String normalize(String value) {

        if (value == null) {
            return null;
        }

        String result = value.trim();

        return result.isEmpty() ? null : result;
    }

    // =========================================================
    // NORMALIZE SEVERITY
    // =========================================================

    private String normalizeSeverity(String severity) {

        if (severity == null || severity.trim().isEmpty()) {
            return "LOW";
        }

        String value = severity.trim().toUpperCase();

        switch (value) {

            case "LOW":
            case "MEDIUM":
            case "HIGH":
            case "CRITICAL":
                return value;

            default:
                return "LOW";
        }
    }

    // =========================================================
    // NORMALIZE CONFIDENCE
    // =========================================================

    private Double normalizeConfidence(
            Double confidence) {

        if (confidence == null) {
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

        return Math.max(
                0.0,
                cost);
    }

    // =========================================================
    // SAFE EXCEPTION MESSAGE
    // =========================================================

    private String safeMessage(Exception ex) {

        if (ex == null
                || ex.getMessage() == null
                || ex.getMessage().trim().isEmpty()) {

            return "Unknown processing error.";
        }

        return ex.getMessage().trim();
    }
}