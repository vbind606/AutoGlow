package com.autoglow.backend.controller;

import com.autoglow.backend.entity.Worker;
import com.autoglow.backend.entity.WorkerAttendance;
import com.autoglow.backend.repository.WorkerAttendanceRepository;
import com.autoglow.backend.repository.WorkerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/attendance")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminAttendanceController {

    private final WorkerAttendanceRepository attendanceRepository;
    private final WorkerRepository workerRepository;

    public AdminAttendanceController(
            WorkerAttendanceRepository attendanceRepository,
            WorkerRepository workerRepository) {

        this.attendanceRepository = attendanceRepository;
        this.workerRepository = workerRepository;
    }

    // =========================================================
    // GET ALL WORKER ATTENDANCE
    // =========================================================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllAttendance() {

        try {

            List<WorkerAttendance> attendanceList =
                    attendanceRepository.findAll();

            List<Map<String, Object>> response =
                    new ArrayList<>();

            for (WorkerAttendance attendance : attendanceList) {

                Map<String, Object> data =
                        new LinkedHashMap<>();

                Long workerId =
                        attendance.getWorkerId();

                data.put("id", attendance.getId());
                data.put("workerId", workerId);

                // -------------------------------------------------
                // GET WORKER DETAILS
                // -------------------------------------------------

                Optional<Worker> workerOptional =
                        workerRepository.findById(workerId);

                if (workerOptional.isPresent()) {

                    Worker worker =
                            workerOptional.get();

                    data.put(
                            "workerName",
                            worker.getName()
                    );

                    data.put(
                            "workerEmail",
                            worker.getEmail()
                    );

                } else {

                    data.put(
                            "workerName",
                            "Unknown Worker"
                    );

                    data.put(
                            "workerEmail",
                            ""
                    );
                }

                // -------------------------------------------------
                // ATTENDANCE DETAILS
                // -------------------------------------------------

                data.put(
                        "attendanceDate",
                        attendance.getAttendanceDate()
                );

                data.put(
                        "checkIn",
                        attendance.getCheckIn()
                );

                data.put(
                        "checkOut",
                        attendance.getCheckOut()
                );

                data.put(
                        "workingMinutes",
                        attendance.getWorkingMinutes()
                );

                data.put(
                        "status",
                        attendance.getStatus()
                );

                data.put(
                        "remarks",
                        attendance.getRemarks()
                );

                response.add(data);
            }

            // -----------------------------------------------------
            // SORT: LATEST DATE FIRST
            // -----------------------------------------------------

            response.sort((a, b) -> {

                Object dateA =
                        a.get("attendanceDate");

                Object dateB =
                        b.get("attendanceDate");

                if (dateA == null || dateB == null) {
                    return 0;
                }

                return dateB.toString()
                        .compareTo(dateA.toString());
            });

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Failed to load attendance records: "
                                    + e.getMessage()
                    );
        }
    }
}