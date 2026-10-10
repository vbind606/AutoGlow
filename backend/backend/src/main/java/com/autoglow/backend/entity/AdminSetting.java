package com.autoglow.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_settings")
public class AdminSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================
    // GENERAL SETTINGS
    // =========================

    @Column(nullable = false, length = 100)
    private String businessName = "AutoGlow";

    @Column(length = 150)
    private String businessEmail;

    @Column(length = 30)
    private String businessPhone;

    @Column(length = 1000)
    private String businessAddress;

    @Column(length = 10)
    private String currency = "INR";

    @Column(length = 50)
    private String timezone = "Asia/Kolkata";

    // =========================
    // BOOKING SETTINGS
    // =========================

    @Column(nullable = false)
    private boolean allowOnlineBooking = true;

    @Column(nullable = false)
    private boolean autoConfirmBooking = false;

    @Column(nullable = false)
    private boolean allowPickupDrop = true;

    @Column(nullable = false)
    private Integer advanceBookingDays = 30;

    @Column(nullable = false)
    private Integer cancellationHours = 4;

    // =========================
    // NOTIFICATION SETTINGS
    // =========================

    @Column(nullable = false)
    private boolean emailNotifications = true;

    @Column(nullable = false)
    private boolean bookingNotifications = true;

    @Column(nullable = false)
    private boolean paymentNotifications = true;

    @Column(nullable = false)
    private boolean reviewNotifications = true;

    @Column(nullable = false)
    private boolean systemNotifications = true;

    // =========================
    // SECURITY SETTINGS
    // =========================

    @Column(nullable = false)
    private boolean twoFactorAuth = false;

    @Column(nullable = false)
    private boolean loginAlerts = true;

    @Column(nullable = false)
    private Integer sessionTimeout = 30;

    // =========================
    // AUDIT
    // =========================

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // =========================
    // CONSTRUCTOR
    // =========================

    public AdminSetting() {
    }

    // =========================
    // PRE PERSIST
    // =========================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (businessName == null || businessName.isBlank()) {
            businessName = "AutoGlow";
        }

        if (currency == null || currency.isBlank()) {
            currency = "INR";
        }

        if (timezone == null || timezone.isBlank()) {
            timezone = "Asia/Kolkata";
        }

        if (advanceBookingDays == null || advanceBookingDays < 1) {
            advanceBookingDays = 30;
        }

        if (cancellationHours == null || cancellationHours < 0) {
            cancellationHours = 4;
        }

        if (sessionTimeout == null || sessionTimeout < 1) {
            sessionTimeout = 30;
        }
    }

    // =========================
    // PRE UPDATE
    // =========================

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // =========================
    // GETTERS & SETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBusinessEmail() {
        return businessEmail;
    }

    public void setBusinessEmail(String businessEmail) {
        this.businessEmail = businessEmail;
    }

    public String getBusinessPhone() {
        return businessPhone;
    }

    public void setBusinessPhone(String businessPhone) {
        this.businessPhone = businessPhone;
    }

    public String getBusinessAddress() {
        return businessAddress;
    }

    public void setBusinessAddress(String businessAddress) {
        this.businessAddress = businessAddress;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public boolean isAllowOnlineBooking() {
        return allowOnlineBooking;
    }

    public void setAllowOnlineBooking(boolean allowOnlineBooking) {
        this.allowOnlineBooking = allowOnlineBooking;
    }

    public boolean isAutoConfirmBooking() {
        return autoConfirmBooking;
    }

    public void setAutoConfirmBooking(boolean autoConfirmBooking) {
        this.autoConfirmBooking = autoConfirmBooking;
    }

    public boolean isAllowPickupDrop() {
        return allowPickupDrop;
    }

    public void setAllowPickupDrop(boolean allowPickupDrop) {
        this.allowPickupDrop = allowPickupDrop;
    }

    public Integer getAdvanceBookingDays() {
        return advanceBookingDays;
    }

    public void setAdvanceBookingDays(Integer advanceBookingDays) {
        this.advanceBookingDays = advanceBookingDays;
    }

    public Integer getCancellationHours() {
        return cancellationHours;
    }

    public void setCancellationHours(Integer cancellationHours) {
        this.cancellationHours = cancellationHours;
    }

    public boolean isEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }

    public boolean isBookingNotifications() {
        return bookingNotifications;
    }

    public void setBookingNotifications(boolean bookingNotifications) {
        this.bookingNotifications = bookingNotifications;
    }

    public boolean isPaymentNotifications() {
        return paymentNotifications;
    }

    public void setPaymentNotifications(boolean paymentNotifications) {
        this.paymentNotifications = paymentNotifications;
    }

    public boolean isReviewNotifications() {
        return reviewNotifications;
    }

    public void setReviewNotifications(boolean reviewNotifications) {
        this.reviewNotifications = reviewNotifications;
    }

    public boolean isSystemNotifications() {
        return systemNotifications;
    }

    public void setSystemNotifications(boolean systemNotifications) {
        this.systemNotifications = systemNotifications;
    }

    public boolean isTwoFactorAuth() {
        return twoFactorAuth;
    }

    public void setTwoFactorAuth(boolean twoFactorAuth) {
        this.twoFactorAuth = twoFactorAuth;
    }

    public boolean isLoginAlerts() {
        return loginAlerts;
    }

    public void setLoginAlerts(boolean loginAlerts) {
        this.loginAlerts = loginAlerts;
    }

    public Integer getSessionTimeout() {
        return sessionTimeout;
    }

    public void setSessionTimeout(Integer sessionTimeout) {
        this.sessionTimeout = sessionTimeout;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}