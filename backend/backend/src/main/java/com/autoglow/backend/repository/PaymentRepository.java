package com.autoglow.backend.repository;

import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

        Optional<Payment> findByBooking(Booking booking);

        Optional<Payment> findByTransactionId(String transactionId);

        List<Payment> findByBookingInOrderByCreatedAtDesc(List<Booking> bookings);

        List<Payment> findAllByOrderByCreatedAtDesc();

        @Query("""
                            SELECT COALESCE(SUM(p.amount), 0)
                            FROM Payment p
                            WHERE p.status = :status
                        """)
        Double sumAmountByStatus(@Param("status") String status);
}