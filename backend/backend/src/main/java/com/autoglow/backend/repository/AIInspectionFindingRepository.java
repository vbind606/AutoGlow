package com.autoglow.backend.repository;

import com.autoglow.backend.entity.AIInspection;
import com.autoglow.backend.entity.AIInspectionFinding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIInspectionFindingRepository
                extends JpaRepository<AIInspectionFinding, Long> {

        /*
         * Get all findings of one inspection.
         *
         * Example:
         *
         * Inspection #10
         * ├── Front Bumper Scratch
         * ├── Left Door Dent
         * └── Bonnet Paint Damage
         */
        List<AIInspectionFinding> findByInspectionOrderByCreatedAtAsc(
                        AIInspection inspection);

        /*
         * Get findings by inspection ID.
         *
         * This is useful when frontend sends only inspectionId.
         */
        List<AIInspectionFinding> findByInspectionIdOrderByCreatedAtAsc(
                        Long inspectionId);

        /*
         * Get findings according to severity.
         *
         * Example:
         * HIGH
         * MEDIUM
         * LOW
         * CRITICAL
         */
        List<AIInspectionFinding> findByInspectionIdAndSeverityIgnoreCaseOrderByCreatedAtAsc(
                        Long inspectionId,
                        String severity);

        /*
         * Count total findings for an inspection.
         */
        long countByInspectionId(
                        Long inspectionId);

        /*
         * Count findings having a particular severity.
         *
         * Example:
         * countByInspectionIdAndSeverityIgnoreCase(10L, "HIGH")
         */
        long countByInspectionIdAndSeverityIgnoreCase(
                        Long inspectionId,
                        String severity);

        /*
         * Delete all findings belonging to one inspection.
         *
         * Useful when an inspection is deleted.
         */
        void deleteByInspection(
                        AIInspection inspection);

        /*
         * Delete all findings belonging to an inspection ID.
         */
        void deleteByInspectionId(
                        Long inspectionId);
}