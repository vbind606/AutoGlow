package com.autoglow.backend.controller;

import com.autoglow.backend.dto.ReviewResponse;
import com.autoglow.backend.service.ReviewService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getMyReviews(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                reviewService.getMyReviews(email));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        String email = authentication.getName();

        Long bookingId = Long.valueOf(
                request.get("bookingId").toString());

        Integer rating = Integer.valueOf(
                request.get("rating").toString());

        String comment = request.get("comment") == null
                ? ""
                : request.get("comment").toString();

        return ResponseEntity.ok(
                reviewService.createReview(
                        bookingId,
                        rating,
                        comment,
                        email));
    }
}