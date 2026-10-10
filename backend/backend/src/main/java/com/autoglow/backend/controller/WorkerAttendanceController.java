package com.autoglow.backend.controller;

import com.autoglow.backend.entity.WorkerAttendance;
import com.autoglow.backend.service.WorkerAttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/worker/attendance")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkerAttendanceController {

    private final WorkerAttendanceService attendanceService;

    public WorkerAttendanceController(
            WorkerAttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // =========================================================
    // CHECK IN
    // POST /api/worker/attendance/check-in/{workerId}
    // =========================================================

    @PostMapping("/check-in/{workerId}")
    public ResponseEntity<?> checkIn(
            @PathVariable Long workerId) {

        try {

            WorkerAttendance attendance = attendanceService.checkIn(workerId);

            return ResponseEntity.ok(attendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    // =========================================================
    // CHECK OUT
    // POST /api/worker/attendance/check-out/{workerId}
    // =========================================================

    @PostMapping("/check-out/{workerId}")
    public ResponseEntity<?> checkOut(
            @PathVariable Long workerId) {

        try {

            WorkerAttendance attendance = attendanceService.checkOut(workerId);

            return ResponseEntity.ok(attendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    // =========================================================
    // TODAY'S ATTENDANCE
    // GET /api/worker/attendance/today/{workerId}
    // =========================================================

    @GetMapping("/today/{workerId}")
    public ResponseEntity<?> getTodayAttendance(
            @PathVariable Long workerId) {

        try {

            WorkerAttendance attendance = attendanceService.getTodayAttendance(workerId);

            if (attendance == null) {

                Map<String, Object> response = new HashMap<>();

                response.put("exists", false);
                response.put("message",
                        "No attendance marked for today");

                return ResponseEntity.ok(response);
            }

            return ResponseEntity.ok(attendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    // =========================================================
    // GET ATTENDANCE BY ID
    // GET /api/worker/attendance/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getAttendanceById(
            @PathVariable Long id) {

        try {

            WorkerAttendance attendance = attendanceService.getAttendanceById(id);

            return ResponseEntity.ok(attendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =========================================================
    // ALL WORKER ATTENDANCE
    // GET /api/worker/attendance/worker/{workerId}
    // =========================================================

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<?> getWorkerAttendance(
            @PathVariable Long workerId) {

        try {

            List<WorkerAttendance> attendance = attendanceService.getWorkerAttendance(workerId);

            return ResponseEntity.ok(attendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    // =========================================================
    // ATTENDANCE BETWEEN DATES
    //
    // GET
    // /api/worker/attendance/worker/{workerId}/range
    // ?startDate=2026-09-01&endDate=2026-09-30
    // =========================================================

    @GetMapping("/worker/{workerId}/range")
    public ResponseEntity<?> getAttendanceBetweenDates(
            @PathVariable Long workerId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {

        try {

            List<WorkerAttendance> attendance = attendanceService.getAttendanceBetweenDates(
                    workerId,
                    startDate,
                    endDate);

            return ResponseEntity.ok(attendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    // =========================================================
    // CURRENT MONTH ATTENDANCE
    // GET /api/worker/attendance/month/{workerId}
    // =========================================================

    @GetMapping("/month/{workerId}")
    public ResponseEntity<?> getCurrentMonthAttendance(
            @PathVariable Long workerId) {

        try {

            List<WorkerAttendance> attendance = attendanceService
                    .getCurrentMonthAttendance(workerId);

            return ResponseEntity.ok(attendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    // =========================================================
    // ATTENDANCE BY STATUS
    //
    // GET
    // /api/worker/attendance/worker/{workerId}/status
    // ?status=PRESENT
    // =========================================================

    @GetMapping("/worker/{workerId}/status")
    public ResponseEntity<?> getAttendanceByStatus(
            @PathVariable Long workerId,
            @RequestParam String status) {

        try {

            List<WorkerAttendance> attendance = attendanceService.getAttendanceByStatus(
                    workerId,
                    status);

            return ResponseEntity.ok(attendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    // =========================================================
    // ATTENDANCE SUMMARY
    // GET /api/worker/attendance/summary/{workerId}
    // =========================================================

    @GetMapping("/summary/{workerId}")
    public ResponseEntity<?> getAttendanceSummary(
            @PathVariable Long workerId) {

        try {

            long presentDays = attendanceService.countPresentDays(workerId);

            long absentDays = attendanceService.countAbsentDays(workerId);

            long halfDays = attendanceService.countHalfDays(workerId);

            Map<String, Object> summary = new HashMap<>();

            summary.put("workerId", workerId);
            summary.put("presentDays", presentDays);
            summary.put("absentDays", absentDays);
            summary.put("halfDays", halfDays);

            return ResponseEntity.ok(summary);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    // =========================================================
    // ERROR RESPONSE
    // =========================================================

    private Map<String, String> createErrorResponse(
            String message) {

        Map<String, String> error = new HashMap<>();

        error.put(
                "message",
                message != null
                        ? message
                        : "Something went wrong");

        return error;
    }
}
