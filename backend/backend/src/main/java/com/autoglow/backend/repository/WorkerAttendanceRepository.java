package com.autoglow.backend.repository;

import com.autoglow.backend.entity.WorkerAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerAttendanceRepository
        extends JpaRepository<WorkerAttendance, Long> {

    // =========================================================
    // GET ATTENDANCE BY WORKER
    // =========================================================

    List<WorkerAttendance> findByWorkerId(Long workerId);


    // =========================================================
    // GET ATTENDANCE BY WORKER + DATE
    // =========================================================

    Optional<WorkerAttendance> findByWorkerIdAndAttendanceDate(
            Long workerId,
            LocalDate attendanceDate
    );


    // =========================================================
    // GET ATTENDANCE BY DATE
    // =========================================================

    List<WorkerAttendance> findByAttendanceDate(
            LocalDate attendanceDate
    );


    // =========================================================
    // GET WORKER ATTENDANCE BETWEEN DATES
    // =========================================================

    List<WorkerAttendance> findByWorkerIdAndAttendanceDateBetween(
            Long workerId,
            LocalDate startDate,
            LocalDate endDate
    );


    // =========================================================
    // GET WORKER ATTENDANCE ORDERED BY DATE
    // =========================================================

    List<WorkerAttendance> findByWorkerIdOrderByAttendanceDateDesc(
            Long workerId
    );


    // =========================================================
    // GET WORKER ATTENDANCE BY STATUS
    // =========================================================

    List<WorkerAttendance> findByWorkerIdAndStatus(
            Long workerId,
            String status
    );


    // =========================================================
    // COUNT WORKER ATTENDANCE BY STATUS
    // =========================================================

    long countByWorkerIdAndStatus(
            Long workerId,
            String status
    );
}
