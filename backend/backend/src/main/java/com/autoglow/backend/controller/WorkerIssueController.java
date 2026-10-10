package com.autoglow.backend.controller;

import com.autoglow.backend.entity.WorkerIssue;
import com.autoglow.backend.service.WorkerIssueService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/worker/issues")
@CrossOrigin
public class WorkerIssueController {

    private final WorkerIssueService workerIssueService;

    public WorkerIssueController(WorkerIssueService workerIssueService) {
        this.workerIssueService = workerIssueService;
    }

    // =========================================================
    // GET ALL ISSUES FOR A BOOKING
    // GET /api/worker/issues/{bookingId}
    // =========================================================
    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getIssuesByBooking(
            @PathVariable Long bookingId) {

        try {

            List<WorkerIssue> issues = workerIssueService.getIssuesByBookingId(bookingId);

            return ResponseEntity.ok(issues);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Failed to load issues",
                            "error", e.getMessage()));
        }
    }

    // =========================================================
    // CREATE ISSUE
    // POST /api/worker/issues/{bookingId}
    // Content-Type: multipart/form-data
    // =========================================================
    @PostMapping(value = "/{bookingId}", consumes = "multipart/form-data")
    public ResponseEntity<?> createIssue(

            @PathVariable Long bookingId,

            @RequestParam(required = false) Long workerId,

            @RequestParam(required = false) String vehicleNumber,

            @RequestParam String category,

            @RequestParam String severity,

            @RequestParam String vehicleArea,

            @RequestParam String description,

            @RequestParam(required = false) Double estimatedCost,

            @RequestParam String recommendedAction,

            @RequestParam(required = false) MultipartFile photo) {

        try {

            WorkerIssue savedIssue = workerIssueService.saveIssue(
                    bookingId,
                    workerId,
                    vehicleNumber,
                    category,
                    severity,
                    vehicleArea,
                    description,
                    estimatedCost,
                    recommendedAction,
                    photo);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedIssue);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", e.getMessage()));

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Failed to create issue",
                            "error", e.getMessage()));
        }
    }

    // =========================================================
    // DELETE ISSUE
    // DELETE /api/worker/issues/{bookingId}/{issueId}
    // =========================================================
    @DeleteMapping("/{bookingId}/{issueId}")
    public ResponseEntity<?> deleteIssue(

            @PathVariable Long bookingId,
            @PathVariable Long issueId) {

        try {

            WorkerIssue issue = workerIssueService.getIssueById(issueId);

            // Make sure issue belongs to this booking
            if (!bookingId.equals(issue.getBookingId())) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "success", false,
                                "message",
                                "Issue does not belong to this booking"));
            }

            workerIssueService.deleteIssue(issueId);

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message", "Issue deleted successfully"));

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", e.getMessage()));

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Failed to delete issue",
                            "error", e.getMessage()));
        }
    }

    // =========================================================
    // UPDATE ISSUE STATUS
    // PATCH /api/worker/issues/{bookingId}/{issueId}/status
    // =========================================================
    @PatchMapping("/{bookingId}/{issueId}/status")
    public ResponseEntity<?> updateIssueStatus(

            @PathVariable Long bookingId,
            @PathVariable Long issueId,

            @RequestParam String status) {

        try {

            WorkerIssue issue = workerIssueService.getIssueById(issueId);

            // Make sure issue belongs to this booking
            if (!bookingId.equals(issue.getBookingId())) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "success", false,
                                "message",
                                "Issue does not belong to this booking"));
            }

            WorkerIssue updatedIssue = workerIssueService.updateIssueStatus(
                    issueId,
                    status);

            return ResponseEntity.ok(updatedIssue);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", e.getMessage()));

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", e.getMessage()));

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Failed to update issue status",
                            "error", e.getMessage()));
        }
    }
}