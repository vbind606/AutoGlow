package com.autoglow.backend.controller;

import com.autoglow.backend.dto.AIInspectionFindingResponse;
import com.autoglow.backend.dto.AIInspectionResponse;
import com.autoglow.backend.service.AIInspectionFileService;
import com.autoglow.backend.service.AdminAIInspectionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/ai-inspections")
public class AdminAIInspectionController {

    private final AdminAIInspectionService inspectionService;
    private final AIInspectionFileService fileService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AdminAIInspectionController(
            AdminAIInspectionService inspectionService,
            AIInspectionFileService fileService) {
        this.inspectionService = inspectionService;
        this.fileService = fileService;
    }

    // =========================================================
    // GET ALL INSPECTIONS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<AIInspectionResponse>> getAllInspections() {

        return ResponseEntity.ok(
                inspectionService.getAllInspections());
    }

    // =========================================================
    // GET INSPECTION BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<AIInspectionResponse> getInspectionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                inspectionService.getInspectionById(id));
    }

    // =========================================================
    // SEARCH BY VEHICLE NUMBER
    // =========================================================

    @GetMapping("/search")
    public ResponseEntity<List<AIInspectionResponse>> searchByVehicleNumber(
            @RequestParam String vehicleNumber) {

        return ResponseEntity.ok(
                inspectionService.searchByVehicleNumber(vehicleNumber));
    }

    // =========================================================
    // GET VEHICLE INSPECTION HISTORY
    // =========================================================

    @GetMapping("/vehicle/{vehicleNumber}")
    public ResponseEntity<List<AIInspectionResponse>> getByVehicle(
            @PathVariable String vehicleNumber) {

        return ResponseEntity.ok(
                inspectionService.getByVehicleNumber(vehicleNumber));
    }

    // =========================================================
    // GET BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AIInspectionResponse>> getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                inspectionService.getByStatus(status));
    }

    // =========================================================
    // CREATE + UPLOAD INSPECTION IMAGE
    // =========================================================

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AIInspectionResponse> createInspection(

            @RequestParam("vehicleNumber") String vehicleNumber,

            @RequestParam(value = "vehicleType", required = false) String vehicleType,

            @RequestParam("image") MultipartFile image) {

        String imageUrl = null;

        try {

            // -------------------------------------------------
            // VALIDATE IMAGE
            // -------------------------------------------------

            if (image == null || image.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .build();
            }

            // -------------------------------------------------
            // SAVE IMAGE
            // -------------------------------------------------

            imageUrl = fileService.saveImage(image);

            // -------------------------------------------------
            // CREATE INSPECTION
            // -------------------------------------------------

            AIInspectionResponse response = inspectionService.createInspection(
                    vehicleNumber,
                    vehicleType,
                    imageUrl);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (Exception ex) {

            // -------------------------------------------------
            // DELETE IMAGE IF DATABASE OPERATION FAILS
            // -------------------------------------------------

            if (imageUrl != null) {
                try {
                    fileService.deleteImage(imageUrl);
                } catch (Exception ignored) {
                    // Do not hide original exception
                }
            }

            throw ex;
        }
    }

    // =========================================================
    // PROCESS INSPECTION
    // =========================================================

    @PostMapping("/{id}/process")
    public ResponseEntity<AIInspectionResponse> processInspection(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                inspectionService.processInspection(id));
    }

    // =========================================================
    // MARK AS PROCESSING ONLY
    // =========================================================

    @PostMapping("/{id}/processing")
    public ResponseEntity<AIInspectionResponse> markAsProcessing(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                inspectionService.markAsProcessing(id));
    }

    // =========================================================
    // COMPLETE INSPECTION MANUALLY
    // =========================================================

    @PostMapping("/{id}/complete")
    public ResponseEntity<AIInspectionResponse> completeInspection(

            @PathVariable Long id,

            @RequestBody(required = false) Map<String, String> request) {

        String summary = null;
        String recommendations = null;

        if (request != null) {

            summary = request.get("summary");
            recommendations = request.get("recommendations");
        }

        return ResponseEntity.ok(
                inspectionService.completeInspection(
                        id,
                        summary,
                        recommendations));
    }

    // =========================================================
    // MARK INSPECTION AS FAILED
    // =========================================================

    @PostMapping("/{id}/failed")
    public ResponseEntity<AIInspectionResponse> markAsFailed(

            @PathVariable Long id,

            @RequestBody(required = false) Map<String, String> request) {

        String errorMessage = "Inspection processing failed.";

        if (request != null && request.get("errorMessage") != null) {

            errorMessage = request.get("errorMessage");
        }

        return ResponseEntity.ok(
                inspectionService.markAsFailed(
                        id,
                        errorMessage));
    }

    // =========================================================
    // GET ALL FINDINGS
    // =========================================================

    @GetMapping("/{id}/findings")
    public ResponseEntity<List<AIInspectionFindingResponse>> getFindings(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                inspectionService.getFindings(id));
    }

    // =========================================================
    // GET FINDINGS BY SEVERITY
    // =========================================================

    @GetMapping("/{id}/findings/severity/{severity}")
    public ResponseEntity<List<AIInspectionFindingResponse>> getFindingsBySeverity(

            @PathVariable Long id,

            @PathVariable String severity) {

        return ResponseEntity.ok(
                inspectionService.getFindingsBySeverity(
                        id,
                        severity));
    }

    // =========================================================
    // ADD MANUAL FINDING
    // =========================================================

    @PostMapping("/{id}/findings")
    public ResponseEntity<AIInspectionFindingResponse> addFinding(

            @PathVariable Long id,

            @RequestBody AIInspectionFindingRequest request) {

        AIInspectionFindingResponse response = inspectionService.addFinding(
                id,
                request.getArea(),
                request.getIssueType(),
                request.getSeverity(),
                request.getConfidence(),
                request.getTitle(),
                request.getDescription(),
                request.getRecommendedAction(),
                request.getEstimatedCost());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // MARK FINDING AS REVIEWED
    // =========================================================

    @PostMapping("/findings/{findingId}/review")
    public ResponseEntity<AIInspectionFindingResponse> markFindingReviewed(

            @PathVariable Long findingId) {

        return ResponseEntity.ok(
                inspectionService.markFindingReviewed(
                        findingId));
    }

    // =========================================================
    // DELETE FINDING
    // =========================================================

    @DeleteMapping("/findings/{findingId}")
    public ResponseEntity<Void> deleteFinding(
            @PathVariable Long findingId) {

        inspectionService.deleteFinding(findingId);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // DELETE INSPECTION
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInspection(
            @PathVariable Long id) {

        inspectionService.deleteInspection(id);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // REQUEST DTO FOR MANUAL FINDING
    // =========================================================

    public static class AIInspectionFindingRequest {

        private String area;

        private String issueType;

        private String severity;

        private Double confidence;

        private String title;

        private String description;

        private String recommendedAction;

        private Double estimatedCost;

        public AIInspectionFindingRequest() {
        }

        public String getArea() {
            return area;
        }

        public void setArea(String area) {
            this.area = area;
        }

        public String getIssueType() {
            return issueType;
        }

        public void setIssueType(String issueType) {
            this.issueType = issueType;
        }

        public String getSeverity() {
            return severity;
        }

        public void setSeverity(String severity) {
            this.severity = severity;
        }

        public Double getConfidence() {
            return confidence;
        }

        public void setConfidence(Double confidence) {
            this.confidence = confidence;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getRecommendedAction() {
            return recommendedAction;
        }

        public void setRecommendedAction(String recommendedAction) {
            this.recommendedAction = recommendedAction;
        }

        public Double getEstimatedCost() {
            return estimatedCost;
        }

        public void setEstimatedCost(Double estimatedCost) {
            this.estimatedCost = estimatedCost;
        }
    }
}