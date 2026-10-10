package com.autoglow.backend.controller;

import com.autoglow.backend.dto.WorkerDashboardResponse;
import com.autoglow.backend.entity.Worker;
import com.autoglow.backend.service.WorkerDashboardService;
import com.autoglow.backend.service.WorkerService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worker")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkerController {

    private final WorkerDashboardService workerDashboardService;
    private final WorkerService workerService;

    public WorkerController(
            WorkerDashboardService workerDashboardService,
            WorkerService workerService) {

        this.workerDashboardService = workerDashboardService;
        this.workerService = workerService;
    }

    // =========================================================
    // WORKER DASHBOARD
    // =========================================================

    @GetMapping("/dashboard")
    public ResponseEntity<WorkerDashboardResponse> dashboard(
            Authentication authentication) {

        String email = authentication.getName();

        WorkerDashboardResponse response = workerDashboardService.getDashboard(email);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // WORKER PROFILE
    // =========================================================

    @GetMapping("/profile")
    public ResponseEntity<Worker> getProfile(
            @RequestParam String email) {

        Worker worker = workerService.getWorkerByEmail(email);

        return ResponseEntity.ok(worker);
    }

    // =========================================================
    // WORKER PROFILE BY ID
    // =========================================================

    @GetMapping("/profile/{id}")
    public ResponseEntity<Worker> getProfileById(
            @PathVariable Long id) {

        Worker worker = workerService.getWorkerById(id);

        return ResponseEntity.ok(worker);
    }
}