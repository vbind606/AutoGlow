package com.autoglow.backend.controller;

import com.autoglow.backend.dto.WorkerInspectionResponse;
import com.autoglow.backend.service.WorkerAIInspectionService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/worker/ai-inspections")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkerAIInspectionController {

    private final WorkerAIInspectionService workerAIInspectionService;

    public WorkerAIInspectionController(
            WorkerAIInspectionService workerAIInspectionService) {

        this.workerAIInspectionService = workerAIInspectionService;
    }

    // =========================================================
    // GET AI INSPECTION
    // =========================================================

    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getInspection(
            @PathVariable Long bookingId,
            Authentication authentication) {

        try {

            String workerEmail = authentication.getName();

            WorkerInspectionResponse response = workerAIInspectionService.getInspection(
                    bookingId,
                    workerEmail);

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            java.util.Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Unable to load AI inspection."));
        }
    }

    // =========================================================
    // CREATE AI INSPECTION + IMAGE UPLOAD
    // =========================================================

    @PostMapping(value = "/{bookingId}/upload", consumes = "multipart/form-data")
    public ResponseEntity<?> createInspection(
            @PathVariable Long bookingId,
            @RequestParam("image") MultipartFile image,
            Authentication authentication) {

        try {

            String workerEmail = authentication.getName();

            WorkerInspectionResponse response = workerAIInspectionService.createInspection(
                    bookingId,
                    workerEmail,
                    image);

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            java.util.Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Unable to create AI inspection."));
        }
    }

    // =========================================================
    // PROCESS AI INSPECTION
    // =========================================================

    @PostMapping("/{bookingId}/process")
    public ResponseEntity<?> processInspection(
            @PathVariable Long bookingId,
            Authentication authentication) {

        try {

            String workerEmail = authentication.getName();

            WorkerInspectionResponse response = workerAIInspectionService.processInspection(
                    bookingId,
                    workerEmail);

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            java.util.Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Unable to process AI inspection."));
        }
    }
}