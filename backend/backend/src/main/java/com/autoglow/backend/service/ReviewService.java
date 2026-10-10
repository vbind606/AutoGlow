package com.autoglow.backend.service;

import com.autoglow.backend.dto.ReviewResponse;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.Review;
import com.autoglow.backend.entity.User;
import com.autoglow.backend.repository.BookingRepository;
import com.autoglow.backend.repository.ReviewRepository;
import com.autoglow.backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            BookingRepository bookingRepository,
            UserRepository userRepository) {

        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    public List<ReviewResponse> getMyReviews(String email) {

        User user = getUser(email);

        return reviewRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse createReview(
            Long bookingId,
            Integer rating,
            String comment,
            String email) {

        User user = getUser(email);

        if (rating == null || rating < 1 || rating > 5) {
            throw new RuntimeException(
                    "Rating must be between 1 and 5");
        }

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new RuntimeException(
                        "Booking not found"));

        if (booking.getUser() == null ||
                !booking.getUser().getId()
                        .equals(user.getId())) {

            throw new RuntimeException(
                    "You cannot review this booking");
        }

        if (booking.getStatus() == null ||
                !booking.getStatus()
                        .name()
                        .equals("DELIVERED")) {

            throw new RuntimeException(
                    "Review is available after service delivery");
        }

        if (reviewRepository.existsByBooking(booking)) {

            throw new RuntimeException(
                    "You have already reviewed this booking");
        }

        Review review = new Review();

        review.setUser(user);
        review.setBooking(booking);
        review.setRating(rating);
        review.setComment(
                comment == null ? "" : comment.trim());
        review.setCreatedAt(LocalDateTime.now());

        Review savedReview = reviewRepository.save(review);

        return toResponse(savedReview);
    }

    private User getUser(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException(
                        "User not found"));
    }

    private ReviewResponse toResponse(Review review) {

        ReviewResponse response = new ReviewResponse();

        Booking booking = review.getBooking();

        response.setId(review.getId());
        response.setBookingId(booking.getId());
        response.setRating(review.getRating());
        response.setComment(review.getComment());

        if (review.getCreatedAt() != null) {
            response.setCreatedAt(
                    review.getCreatedAt().toString());
        }

        if (review.getUser() != null) {
            response.setCustomerName(
                    review.getUser().getName());
        }

        if (booking.getService() != null) {
            response.setServiceName(
                    booking.getService().getName());
        }

        if (booking.getServicePackage() != null) {
            response.setPackageName(
                    booking.getServicePackage().getName());
        }

        if (booking.getVehicle() != null) {

            String brand = booking.getVehicle().getBrand();

            String model = booking.getVehicle().getModel();

            String vehicleName = ((brand == null ? "" : brand + " ")
                    + (model == null ? "" : model))
                    .trim();

            response.setVehicleName(
                    vehicleName.isEmpty()
                            ? "Vehicle"
                            : vehicleName);

            response.setVehicleNumber(
                    booking.getVehicle()
                            .getRegistrationNumber());
        }

        return response;
    }
}