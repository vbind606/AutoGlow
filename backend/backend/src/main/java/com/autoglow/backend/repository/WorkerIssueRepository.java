package com.autoglow.backend.repository;

import com.autoglow.backend.entity.WorkerIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkerIssueRepository extends JpaRepository<WorkerIssue, Long> {

    // Get all issues for a particular booking
    List<WorkerIssue> findByBookingId(Long bookingId);

    // Get all issues reported by a particular worker
    List<WorkerIssue> findByWorkerId(Long workerId);

    // Get booking issues with newest issue first
    List<WorkerIssue> findByBookingIdOrderByCreatedAtDesc(Long bookingId);
}