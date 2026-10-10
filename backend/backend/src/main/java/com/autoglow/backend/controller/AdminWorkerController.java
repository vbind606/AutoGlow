package com.autoglow.backend.controller;

import com.autoglow.backend.dto.WorkerCreateRequest;
import com.autoglow.backend.entity.Worker;
import com.autoglow.backend.service.WorkerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class AdminWorkerController {

    private final WorkerService workerService;

    public AdminWorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }

    @GetMapping("/api/admin/workers")
    public ResponseEntity<List<Worker>> getAllWorkers() {
        return ResponseEntity.ok(workerService.getAllWorkers());
    }

    @GetMapping("/api/admin/workers/{id}")
    public ResponseEntity<Worker> getWorkerById(@PathVariable Long id) {
        return ResponseEntity.ok(workerService.getWorkerById(id));
    }

    @PostMapping("/api/admin/workers")
    public ResponseEntity<Worker> createWorker(
            @RequestBody WorkerCreateRequest request) {

        return ResponseEntity.ok(
                workerService.createWorker(request));
    }

    @PutMapping("/api/admin/workers/{id}")
    public ResponseEntity<Worker> updateWorker(
            @PathVariable Long id,
            @RequestBody WorkerCreateRequest request) {

        return ResponseEntity.ok(
                workerService.updateWorker(id, request));
    }

    @DeleteMapping("/api/admin/workers/{id}")
    public ResponseEntity<String> deleteWorker(
            @PathVariable Long id) {

        workerService.deleteWorker(id);

        return ResponseEntity.ok(
                "Worker deleted successfully");
    }

    @PatchMapping("/api/admin/workers/{id}/toggle")
    public ResponseEntity<Worker> toggleWorker(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                workerService.toggleWorker(id));
    }
}