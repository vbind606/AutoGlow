package com.autoglow.backend.controller;

import com.autoglow.backend.dto.ReviewResponse;
import com.autoglow.backend.service.AdminReviewService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminReviewController {

    private final AdminReviewService adminReviewService;

    public AdminReviewController(
            AdminReviewService adminReviewService) {
        this.adminReviewService = adminReviewService;
    }

    /**
     * Get all reviews.
     */
    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {

        return ResponseEntity.ok(
                adminReviewService.getAllReviews());
    }

    /**
     * Get review by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getReviewById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                adminReviewService.getReviewById(id));
    }

    /**
     * Delete review.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id) {

        adminReviewService.deleteReview(id);

        return ResponseEntity.noContent().build();
    }
}