package com.autoglow.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "worker_attendance",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_worker_attendance_date",
            columnNames = {"worker_id", "attendance_date"}
        )
    }
)
public class WorkerAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Worker ID
    @Column(name = "worker_id", nullable = false)
    private Long workerId;

    // Attendance date
    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    // PRESENT / ABSENT / HALF_DAY / LEAVE
    @Column(length = 20, nullable = false)
    private String status = "PRESENT";

    // Check-in time
    private LocalDateTime checkIn;

    // Check-out time
    private LocalDateTime checkOut;

    // Total working minutes
    private Long workingMinutes;

    // Optional remarks
    @Column(length = 500)
    private String remarks;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    // =========================================================
    // PRE PERSIST
    // =========================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null || status.isBlank()) {
            status = "PRESENT";
        }

        if (attendanceDate == null) {
            attendanceDate = LocalDate.now();
        }
    }


    // =========================================================
    // PRE UPDATE
    // =========================================================

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }


    // =========================================================
    // GETTERS & SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Long getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }


    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    public LocalDateTime getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(LocalDateTime checkIn) {
        this.checkIn = checkIn;
    }


    public LocalDateTime getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(LocalDateTime checkOut) {
        this.checkOut = checkOut;
    }


    public Long getWorkingMinutes() {
        return workingMinutes;
    }

    public void setWorkingMinutes(Long workingMinutes) {
        this.workingMinutes = workingMinutes;
    }


    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
