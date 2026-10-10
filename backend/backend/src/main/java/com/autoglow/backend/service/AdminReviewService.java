package com.autoglow.backend.service;

import com.autoglow.backend.dto.ReviewResponse;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.Review;
import com.autoglow.backend.repository.ReviewRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminReviewService {

    private final ReviewRepository reviewRepository;

    public AdminReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    /**
     * Get all reviews for admin.
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviews() {

        return reviewRepository.findAll()
                .stream()
                .sorted(
                        Comparator.comparing(
                                Review::getCreatedAt,
                                Comparator.nullsLast(
                                        Comparator.reverseOrder())))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get single review by ID.
     */
    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(Long id) {

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + id));

        return toResponse(review);
    }

    /**
     * Delete review.
     */
    @Transactional
    public void deleteReview(Long id) {

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + id));

        reviewRepository.delete(review);
    }

    /**
     * Convert Review entity to ReviewResponse.
     */
    private ReviewResponse toResponse(Review review) {

        ReviewResponse response = new ReviewResponse();

        response.setId(review.getId());
        response.setRating(review.getRating());
        response.setComment(
                review.getComment() == null
                        ? ""
                        : review.getComment());

        if (review.getCreatedAt() != null) {
            response.setCreatedAt(
                    review.getCreatedAt().toString());
        }

        /*
         * Customer
         */
        if (review.getUser() != null) {

            response.setCustomerName(
                    review.getUser().getName());
        }

        /*
         * Booking
         */
        Booking booking = review.getBooking();

        if (booking != null) {

            response.setBookingId(
                    booking.getId());

            /*
             * Service
             */
            if (booking.getService() != null) {

                response.setServiceName(
                        booking.getService().getName());
            }

            /*
             * Package
             */
            if (booking.getServicePackage() != null) {

                response.setPackageName(
                        booking.getServicePackage().getName());
            }

            /*
             * Vehicle
             */
            if (booking.getVehicle() != null) {

                String brand = booking.getVehicle().getBrand();

                String model = booking.getVehicle().getModel();

                String vehicleName = ((brand == null
                        ? ""
                        : brand + " ")
                        +
                        (model == null
                                ? ""
                                : model))
                        .trim();

                response.setVehicleName(
                        vehicleName.isEmpty()
                                ? "Vehicle"
                                : vehicleName);

                response.setVehicleNumber(
                        booking.getVehicle()
                                .getRegistrationNumber());
            }
        }

        return response;
    }
}