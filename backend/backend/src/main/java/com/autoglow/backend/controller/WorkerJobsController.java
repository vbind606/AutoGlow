package com.autoglow.backend.controller;

import com.autoglow.backend.entity.BookingStatus;
import com.autoglow.backend.service.WorkerJobsService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/worker")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {
        RequestMethod.GET,
        RequestMethod.PATCH,
        RequestMethod.OPTIONS
})
public class WorkerJobsController {

    private final WorkerJobsService workerJobsService;

    public WorkerJobsController(WorkerJobsService workerJobsService) {
        this.workerJobsService = workerJobsService;
    }

    @GetMapping("/jobs")
    public ResponseEntity<?> getMyJobs(
            Authentication authentication) {

        try {

            if (authentication == null) {
                return ResponseEntity
                        .status(401)
                        .body(Map.of(
                                "message",
                                "Worker authentication required."));
            }

            String email = authentication.getName();

            return ResponseEntity.ok(
                    workerJobsService.getMyJobs(email));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(500)
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Failed to load worker jobs."));
        }
    }

    @PatchMapping("/jobs/{bookingId}/status")
    public ResponseEntity<?> updateJobStatus(
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        try {

            System.out.println("WORKER STATUS UPDATE");
            System.out.println("BOOKING ID: " + bookingId);

            if (authentication == null) {
                return ResponseEntity
                        .status(401)
                        .body(Map.of(
                                "message",
                                "Worker authentication required."));
            }

            String email = authentication.getName();

            String statusValue = request != null
                    ? request.get("status")
                    : null;

            if (statusValue == null ||
                    statusValue.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Status is required."));
            }

            BookingStatus status;

            try {

                status = BookingStatus.valueOf(
                        statusValue.trim().toUpperCase());

            } catch (IllegalArgumentException e) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Invalid booking status: "
                                        + statusValue));
            }

            return ResponseEntity.ok(
                    workerJobsService.updateJobStatus(
                            email,
                            bookingId,
                            status));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(500)
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Status update failed."));
        }
    }
}