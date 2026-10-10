package com.autoglow.backend.repository;

import com.autoglow.backend.entity.ServiceChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceChecklistRepository extends JpaRepository<ServiceChecklist, Long> {

    // Get all checklist records for a booking
    List<ServiceChecklist> findByBookingId(Long bookingId);

    // Get checklist of a particular worker
    List<ServiceChecklist> findByWorkerId(Long workerId);

    // Get latest checklist of a booking
    Optional<ServiceChecklist> findFirstByBookingIdOrderByCreatedAtDesc(Long bookingId);
}