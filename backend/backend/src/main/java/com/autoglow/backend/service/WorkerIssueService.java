package com.autoglow.backend.service;

import com.autoglow.backend.entity.WorkerIssue;
import com.autoglow.backend.repository.WorkerIssueRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class WorkerIssueService {

    private final WorkerIssueRepository workerIssueRepository;

    // =========================================================
    // UPLOAD DIRECTORY
    // =========================================================
    private static final String UPLOAD_DIR = "uploads/issues/";

    // =========================================================
    // CONSTRUCTOR
    // =========================================================
    public WorkerIssueService(
            WorkerIssueRepository workerIssueRepository) {
        this.workerIssueRepository = workerIssueRepository;
    }

    // =========================================================
    // SAVE ISSUE
    // =========================================================
    public WorkerIssue saveIssue(
            Long bookingId,
            Long workerId,
            String vehicleNumber,
            String category,
            String severity,
            String vehicleArea,
            String description,
            Double estimatedCost,
            String recommendedAction,
            MultipartFile photo) throws IOException {

        // Validate issue data
        validateIssueData(
                bookingId,
                category,
                severity,
                vehicleArea,
                description,
                estimatedCost,
                recommendedAction);

        // Create new issue object
        WorkerIssue issue = new WorkerIssue();

        issue.setBookingId(bookingId);
        issue.setWorkerId(workerId);
        issue.setVehicleNumber(vehicleNumber);
        issue.setCategory(category);
        issue.setSeverity(severity);
        issue.setVehicleArea(vehicleArea);
        issue.setDescription(description);
        issue.setEstimatedCost(estimatedCost);
        issue.setRecommendedAction(recommendedAction);

        // Default status
        issue.setStatus("OPEN");

        // =====================================================
        // SAVE PHOTO
        // =====================================================
        if (photo != null && !photo.isEmpty()) {

            String photoPath = savePhoto(photo);

            issue.setPhotoPath(photoPath);
        }

        // Save issue to PostgreSQL
        return workerIssueRepository.save(issue);
    }

    // =========================================================
    // GET ISSUES BY BOOKING
    // =========================================================
    public List<WorkerIssue> getIssuesByBookingId(
            Long bookingId) {

        return workerIssueRepository
                .findByBookingIdOrderByCreatedAtDesc(bookingId);
    }

    // =========================================================
    // GET ISSUES BY WORKER
    // =========================================================
    public List<WorkerIssue> getIssuesByWorkerId(
            Long workerId) {

        return workerIssueRepository
                .findByWorkerId(workerId);
    }

    // =========================================================
    // GET ISSUE BY ID
    // =========================================================
    public WorkerIssue getIssueById(
            Long issueId) {

        return workerIssueRepository
                .findById(issueId)
                .orElseThrow(() -> new RuntimeException(
                        "Worker issue not found with ID: "
                                + issueId));
    }

    // =========================================================
    // DELETE ISSUE
    // =========================================================
    public void deleteIssue(
            Long issueId) throws IOException {

        WorkerIssue issue = getIssueById(issueId);

        // Delete uploaded photo if available
        if (issue.getPhotoPath() != null
                && !issue.getPhotoPath().isBlank()) {

            deletePhoto(issue.getPhotoPath());
        }

        // Delete issue from database
        workerIssueRepository.delete(issue);
    }

    // =========================================================
    // UPDATE ISSUE STATUS
    // =========================================================
    public WorkerIssue updateIssueStatus(
            Long issueId,
            String status) {

        if (status == null || status.isBlank()) {

            throw new IllegalArgumentException(
                    "Issue status cannot be empty");
        }

        WorkerIssue issue = getIssueById(issueId);

        issue.setStatus(status.toUpperCase());

        return workerIssueRepository.save(issue);
    }

    // =========================================================
    // SAVE PHOTO
    // =========================================================
    private String savePhoto(
            MultipartFile photo) throws IOException {

        // Validate photo
        validatePhoto(photo);

        // Create upload directory
        Path uploadPath = Paths.get(UPLOAD_DIR);

        if (!Files.exists(uploadPath)) {

            Files.createDirectories(uploadPath);
        }

        // Original filename
        String originalFilename = photo.getOriginalFilename();

        // Get extension
        String extension = getFileExtension(originalFilename);

        // Generate unique filename
        String uniqueFilename = UUID.randomUUID() + extension;

        // Final file location
        Path targetPath = uploadPath.resolve(uniqueFilename);

        // Copy uploaded file
        Files.copy(
                photo.getInputStream(),
                targetPath,
                StandardCopyOption.REPLACE_EXISTING);

        // Return relative path
        return UPLOAD_DIR + uniqueFilename;
    }

    // =========================================================
    // DELETE PHOTO
    // =========================================================
    private void deletePhoto(
            String photoPath) throws IOException {

        Path path = Paths.get(photoPath);

        if (Files.exists(path)) {

            Files.delete(path);
        }
    }

    // =========================================================
    // PHOTO VALIDATION
    // =========================================================
    private void validatePhoto(
            MultipartFile photo) {

        if (photo == null || photo.isEmpty()) {

            return;
        }

        // Maximum file size = 5 MB
        long maxFileSize = 5L * 1024 * 1024;

        if (photo.getSize() > maxFileSize) {

            throw new IllegalArgumentException(
                    "Photo size must not exceed 5 MB");
        }

        String contentType = photo.getContentType();

        // Allowed image types
        if (contentType == null
                || !(contentType.equalsIgnoreCase(
                        "image/jpeg")
                        || contentType.equalsIgnoreCase(
                                "image/png")
                        || contentType.equalsIgnoreCase(
                                "image/webp"))) {

            throw new IllegalArgumentException(
                    "Only JPEG, PNG and WebP images are allowed");
        }
    }

    // =========================================================
    // GET FILE EXTENSION
    // =========================================================
    private String getFileExtension(
            String filename) {

        if (filename == null
                || !filename.contains(".")) {

            return "";
        }

        return filename
                .substring(
                        filename.lastIndexOf("."))
                .toLowerCase();
    }

    // =========================================================
    // ISSUE DATA VALIDATION
    // =========================================================
    private void validateIssueData(
            Long bookingId,
            String category,
            String severity,
            String vehicleArea,
            String description,
            Double estimatedCost,
            String recommendedAction) {

        // Booking ID
        if (bookingId == null) {

            throw new IllegalArgumentException(
                    "Booking ID is required");
        }

        // Category
        if (category == null
                || category.isBlank()) {

            throw new IllegalArgumentException(
                    "Issue category is required");
        }

        // Severity
        if (severity == null
                || severity.isBlank()) {

            throw new IllegalArgumentException(
                    "Issue severity is required");
        }

        // Vehicle area
        if (vehicleArea == null
                || vehicleArea.isBlank()) {

            throw new IllegalArgumentException(
                    "Vehicle area is required");
        }

        // Description
        if (description == null
                || description.isBlank()) {

            throw new IllegalArgumentException(
                    "Issue description is required");
        }

        // Estimated cost
        if (estimatedCost != null
                && estimatedCost < 0) {

            throw new IllegalArgumentException(
                    "Estimated cost cannot be negative");
        }

        // Recommended action
        if (recommendedAction == null
                || recommendedAction.isBlank()) {

            throw new IllegalArgumentException(
                    "Recommended action is required");
        }
    }
}