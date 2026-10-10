package com.autoglow.backend.repository;

import com.autoglow.backend.entity.AIInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIInspectionRepository extends JpaRepository<AIInspection, Long> {

        /*
         * Get all inspections, newest first.
         */
        List<AIInspection> findAllByOrderByCreatedAtDesc();

        /*
         * Get inspections for a particular vehicle number.
         *
         * Example:
         * MH12AB1234
         */
        List<AIInspection> findByVehicleNumberIgnoreCaseOrderByCreatedAtDesc(
                        String vehicleNumber);

        /*
         * Get inspections by processing status.
         *
         * Example:
         * PENDING
         * PROCESSING
         * COMPLETED
         * FAILED
         */
        List<AIInspection> findByStatusIgnoreCaseOrderByCreatedAtDesc(
                        String status);

        /*
         * Search vehicle number.
         *
         * Useful for admin search.
         */
        List<AIInspection> findByVehicleNumberContainingIgnoreCaseOrderByCreatedAtDesc(
                        String vehicleNumber);
}