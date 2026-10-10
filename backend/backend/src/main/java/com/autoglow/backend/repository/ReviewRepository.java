package com.autoglow.backend.repository;

import com.autoglow.backend.entity.Review;
import com.autoglow.backend.entity.User;
import com.autoglow.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByUserOrderByCreatedAtDesc(User user);

    Optional<Review> findByBooking(Booking booking);

    boolean existsByBooking(Booking booking);
}