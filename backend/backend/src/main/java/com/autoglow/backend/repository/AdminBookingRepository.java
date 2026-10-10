package com.autoglow.backend.repository;

import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.BookingStatus;
import com.autoglow.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdminBookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserOrderByBookingDateDescBookingTimeDesc(User user);

    Optional<Booking> findByIdAndUser(Long id, User user);

    long countByStatus(BookingStatus status);

    List<Booking> findTop5ByOrderByIdDesc();

    List<Booking> findAllByOrderByBookingDateDescBookingTimeDesc();
}