package com.autoglow.backend.controller;

import com.autoglow.backend.dto.InspectionRequest;
import com.autoglow.backend.entity.Inspection;
import com.autoglow.backend.service.InspectionService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worker/inspections")
public class InspectionController {

    private final InspectionService inspectionService;

    public InspectionController(InspectionService inspectionService) {
        this.inspectionService = inspectionService;
    }

    @PostMapping("/{bookingId}")
    public ResponseEntity<?> saveInspection(
            @PathVariable Long bookingId,
            @RequestBody InspectionRequest request,
            Authentication authentication) {

        try {

            String workerEmail = authentication.getName();

            Inspection inspection = inspectionService.saveInspection(
                    bookingId,
                    request,
                    workerEmail);

            return ResponseEntity.ok(inspection);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            java.util.Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Unable to save inspection."));
        }
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getInspection(
            @PathVariable Long bookingId,
            Authentication authentication) {

        try {

            String workerEmail = authentication.getName();

            Inspection inspection = inspectionService.getInspection(
                    bookingId,
                    workerEmail);

            if (inspection == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(inspection);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            java.util.Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Unable to load inspection."));
        }
    }
}