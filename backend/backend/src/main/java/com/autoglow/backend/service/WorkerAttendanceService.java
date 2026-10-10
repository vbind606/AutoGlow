
package com.autoglow.backend.service;

import com.autoglow.backend.entity.WorkerAttendance;
import com.autoglow.backend.repository.WorkerAttendanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkerAttendanceService {

    private final WorkerAttendanceRepository attendanceRepository;

    public WorkerAttendanceService(
            WorkerAttendanceRepository attendanceRepository
    ) {
        this.attendanceRepository = attendanceRepository;
    }


    // =========================================================
    // CHECK IN
    // =========================================================

    @Transactional
    public WorkerAttendance checkIn(Long workerId) {

        if (workerId == null) {
            throw new RuntimeException("Worker ID is required");
        }

        LocalDate today = LocalDate.now();

        WorkerAttendance attendance =
                attendanceRepository
                        .findByWorkerIdAndAttendanceDate(workerId, today)
                        .orElse(null);

        // -----------------------------------------------------
        // Already checked in
        // -----------------------------------------------------

        if (attendance != null && attendance.getCheckIn() != null) {
            throw new RuntimeException(
                    "Worker has already checked in today"
            );
        }

        // -----------------------------------------------------
        // Create new attendance
        // -----------------------------------------------------

        if (attendance == null) {

            attendance = new WorkerAttendance();

            attendance.setWorkerId(workerId);
            attendance.setAttendanceDate(today);
            attendance.setStatus("PRESENT");
        }

        attendance.setCheckIn(LocalDateTime.now());

        attendance.setCheckOut(null);

        attendance.setWorkingMinutes(null);

        return attendanceRepository.save(attendance);
    }


    // =========================================================
    // CHECK OUT
    // =========================================================

    @Transactional
    public WorkerAttendance checkOut(Long workerId) {

        if (workerId == null) {
            throw new RuntimeException("Worker ID is required");
        }

        LocalDate today = LocalDate.now();

        WorkerAttendance attendance =
                attendanceRepository
                        .findByWorkerIdAndAttendanceDate(workerId, today)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Today's attendance not found. Please check in first."
                                )
                        );

        // -----------------------------------------------------
        // Check-in validation
        // -----------------------------------------------------

        if (attendance.getCheckIn() == null) {
            throw new RuntimeException(
                    "Please check in before checking out"
            );
        }

        // -----------------------------------------------------
        // Already checked out
        // -----------------------------------------------------

        if (attendance.getCheckOut() != null) {
            throw new RuntimeException(
                    "Worker has already checked out today"
            );
        }

        // -----------------------------------------------------
        // Set checkout
        // -----------------------------------------------------

        LocalDateTime checkOut = LocalDateTime.now();

        attendance.setCheckOut(checkOut);

        // -----------------------------------------------------
        // Calculate working minutes
        // -----------------------------------------------------

        long workingMinutes =
                Duration.between(
                        attendance.getCheckIn(),
                        checkOut
                ).toMinutes();

        attendance.setWorkingMinutes(workingMinutes);

        return attendanceRepository.save(attendance);
    }


    // =========================================================
    // GET TODAY'S ATTENDANCE
    // =========================================================

    public WorkerAttendance getTodayAttendance(Long workerId) {

        if (workerId == null) {
            throw new RuntimeException("Worker ID is required");
        }

        return attendanceRepository
                .findByWorkerIdAndAttendanceDate(
                        workerId,
                        LocalDate.now()
                )
                .orElse(null);
    }


    // =========================================================
    // GET ATTENDANCE BY ID
    // =========================================================

    public WorkerAttendance getAttendanceById(Long id) {

        return attendanceRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Attendance record not found"
                        )
                );
    }


    // =========================================================
    // GET ALL WORKER ATTENDANCE
    // =========================================================

    public List<WorkerAttendance> getWorkerAttendance(
            Long workerId
    ) {

        if (workerId == null) {
            throw new RuntimeException("Worker ID is required");
        }

        return attendanceRepository
                .findByWorkerIdOrderByAttendanceDateDesc(
                        workerId
                );
    }


    // =========================================================
    // GET ATTENDANCE BETWEEN DATES
    // =========================================================

    public List<WorkerAttendance> getAttendanceBetweenDates(
            Long workerId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (workerId == null) {
            throw new RuntimeException("Worker ID is required");
        }

        if (startDate == null || endDate == null) {
            throw new RuntimeException(
                    "Start date and end date are required"
            );
        }

        if (startDate.isAfter(endDate)) {
            throw new RuntimeException(
                    "Start date cannot be after end date"
            );
        }

        return attendanceRepository
                .findByWorkerIdAndAttendanceDateBetween(
                        workerId,
                        startDate,
                        endDate
                );
    }


    // =========================================================
    // GET CURRENT MONTH ATTENDANCE
    // =========================================================

    public List<WorkerAttendance> getCurrentMonthAttendance(
            Long workerId
    ) {

        LocalDate today = LocalDate.now();

        LocalDate firstDay =
                today.withDayOfMonth(1);

        LocalDate lastDay =
                today.withDayOfMonth(
                        today.lengthOfMonth()
                );

        return getAttendanceBetweenDates(
                workerId,
                firstDay,
                lastDay
        );
    }


    // =========================================================
    // GET ATTENDANCE BY STATUS
    // =========================================================

    public List<WorkerAttendance> getAttendanceByStatus(
            Long workerId,
            String status
    ) {

        if (workerId == null) {
            throw new RuntimeException("Worker ID is required");
        }

        if (status == null || status.isBlank()) {
            throw new RuntimeException(
                    "Attendance status is required"
            );
        }

        return attendanceRepository
                .findByWorkerIdAndStatus(
                        workerId,
                        status.toUpperCase()
                );
    }


    // =========================================================
    // COUNT PRESENT DAYS
    // =========================================================

    public long countPresentDays(Long workerId) {

        return attendanceRepository
                .countByWorkerIdAndStatus(
                        workerId,
                        "PRESENT"
                );
    }


    // =========================================================
    // COUNT ABSENT DAYS
    // =========================================================

    public long countAbsentDays(Long workerId) {

        return attendanceRepository
                .countByWorkerIdAndStatus(
                        workerId,
                        "ABSENT"
                );
    }


    // =========================================================
    // COUNT HALF DAYS
    // =========================================================

    public long countHalfDays(Long workerId) {

        return attendanceRepository
                .countByWorkerIdAndStatus(
                        workerId,
                        "HALF_DAY"
                );
    }


    // =========================================================
    // WORKING MINUTES
    // =========================================================

    public long calculateWorkingMinutes(
            WorkerAttendance attendance
    ) {

        if (attendance == null) {
            return 0;
        }

        if (attendance.getCheckIn() == null ||
                attendance.getCheckOut() == null) {
            return 0;
        }

        return Duration.between(
                attendance.getCheckIn(),
                attendance.getCheckOut()
        ).toMinutes();
    }


    // =========================================================
    // FORMAT WORKING HOURS
    // =========================================================

    public String formatWorkingHours(
            WorkerAttendance attendance
    ) {

        long minutes =
                calculateWorkingMinutes(attendance);

        if (minutes <= 0) {
            return "--";
        }

        long hours = minutes / 60;

        long remainingMinutes = minutes % 60;

        return hours + "h " +
                remainingMinutes + "m";
    }
}
