package com.autoglow.backend.controller;

import com.autoglow.backend.dto.AdminReportsResponse;
import com.autoglow.backend.service.AdminReportsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportsController {

    private final AdminReportsService reportsService;

    public AdminReportsController(AdminReportsService reportsService) {
        this.reportsService = reportsService;
    }

    /**
     * Get complete admin reports.
     *
     * GET /api/admin/reports
     */
    @GetMapping
    public ResponseEntity<AdminReportsResponse> getReports() {

        AdminReportsResponse response = reportsService.getReports();

        return ResponseEntity.ok(response);
    }
}
