package com.autoglow.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_payment_transaction", columnList = "transaction_id"),
        @Index(name = "idx_payment_created", columnList = "created_at"),
        @Index(name = "idx_payment_date", columnList = "payment_date")
})
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // BOOKING
    // =========================================================

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    // =========================================================
    // PAYMENT AMOUNT
    // =========================================================

    @Column(nullable = false)
    private Double amount = 0.0;

    // =========================================================
    // PAYMENT STATUS
    // =========================================================

    @Column(nullable = false, length = 30)
    private String status = "PENDING";

    // =========================================================
    // PAYMENT METHOD
    // =========================================================

    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod;

    // =========================================================
    // TRANSACTION ID
    // =========================================================

    @Column(name = "transaction_id", unique = true, length = 100)
    private String transactionId;

    // =========================================================
    // PAYMENT DATE
    // Existing database column
    // =========================================================

    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;

    // =========================================================
    // CREATED AT
    // =========================================================

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // =========================================================
    // PAID AT
    // =========================================================

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    // =========================================================
    // PRE PERSIST
    // =========================================================

    @PrePersist
    public void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (paymentDate == null) {
            paymentDate = now;
        }

        if (paidAt == null && "SUCCESS".equalsIgnoreCase(status)) {
            paidAt = now;
        }

        if (amount == null) {
            amount = 0.0;
        }

        if (status == null || status.isBlank()) {
            status = "PENDING";
        }
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
}