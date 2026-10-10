package com.autoglow.backend.controller;

import com.autoglow.backend.dto.WorkerProfileResponse;
import com.autoglow.backend.service.WorkerProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worker/profile")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkerProfileController {

    private final WorkerProfileService workerProfileService;

    public WorkerProfileController(
            WorkerProfileService workerProfileService
    ) {
        this.workerProfileService = workerProfileService;
    }

    @GetMapping("/{workerId}")
    public ResponseEntity<?> getWorkerProfile(
            @PathVariable String workerId
    ) {

        try {

            System.out.println("=================================");
            System.out.println("Worker Profile API Called");
            System.out.println("Worker ID received: " + workerId);
            System.out.println("=================================");

            // Check worker ID
            if (workerId == null || workerId.trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("Worker ID is required");
            }

            Long id;

            try {
                id = Long.parseLong(workerId);
            } catch (NumberFormatException e) {

                return ResponseEntity
                        .badRequest()
                        .body("Invalid Worker ID: " + workerId);
            }

            WorkerProfileResponse profile =
                    workerProfileService.getWorkerProfile(id);

            return ResponseEntity.ok(profile);

        } catch (RuntimeException e) {

            System.out.println(
                    "Worker Profile Error: " + e.getMessage()
            );

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unable to load worker profile");
        }
    }
}