package com.autoglow.backend.service;

import com.autoglow.backend.entity.AdminSetting;
import com.autoglow.backend.repository.AdminSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminSettingService {

    private final AdminSettingRepository adminSettingRepository;

    public AdminSettingService(AdminSettingRepository adminSettingRepository) {
        this.adminSettingRepository = adminSettingRepository;
    }

    // ==========================================
    // GET SETTINGS
    // ==========================================

    @Transactional
    public AdminSetting getSettings() {

        return adminSettingRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(this::createDefaultSettings);
    }

    // ==========================================
    // UPDATE SETTINGS
    // ==========================================

    @Transactional
    public AdminSetting updateSettings(AdminSetting updatedSettings) {

        AdminSetting settings = adminSettingRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(this::createDefaultSettings);

        // General
        if (updatedSettings.getBusinessName() != null
                && !updatedSettings.getBusinessName().isBlank()) {
            settings.setBusinessName(updatedSettings.getBusinessName().trim());
        }

        settings.setBusinessEmail(updatedSettings.getBusinessEmail());
        settings.setBusinessPhone(updatedSettings.getBusinessPhone());
        settings.setBusinessAddress(updatedSettings.getBusinessAddress());

        if (updatedSettings.getCurrency() != null
                && !updatedSettings.getCurrency().isBlank()) {
            settings.setCurrency(updatedSettings.getCurrency().trim());
        }

        if (updatedSettings.getTimezone() != null
                && !updatedSettings.getTimezone().isBlank()) {
            settings.setTimezone(updatedSettings.getTimezone().trim());
        }

        // Booking
        settings.setAllowOnlineBooking(
                updatedSettings.isAllowOnlineBooking());

        settings.setAutoConfirmBooking(
                updatedSettings.isAutoConfirmBooking());

        settings.setAllowPickupDrop(
                updatedSettings.isAllowPickupDrop());

        if (updatedSettings.getAdvanceBookingDays() != null
                && updatedSettings.getAdvanceBookingDays() > 0) {
            settings.setAdvanceBookingDays(
                    updatedSettings.getAdvanceBookingDays());
        }

        if (updatedSettings.getCancellationHours() != null
                && updatedSettings.getCancellationHours() >= 0) {
            settings.setCancellationHours(
                    updatedSettings.getCancellationHours());
        }

        // Notifications
        settings.setEmailNotifications(
                updatedSettings.isEmailNotifications());

        settings.setBookingNotifications(
                updatedSettings.isBookingNotifications());

        settings.setPaymentNotifications(
                updatedSettings.isPaymentNotifications());

        settings.setReviewNotifications(
                updatedSettings.isReviewNotifications());

        settings.setSystemNotifications(
                updatedSettings.isSystemNotifications());

        // Security
        settings.setTwoFactorAuth(
                updatedSettings.isTwoFactorAuth());

        settings.setLoginAlerts(
                updatedSettings.isLoginAlerts());

        if (updatedSettings.getSessionTimeout() != null
                && updatedSettings.getSessionTimeout() > 0) {
            settings.setSessionTimeout(
                    updatedSettings.getSessionTimeout());
        }

        return adminSettingRepository.save(settings);
    }

    // ==========================================
    // RESET SETTINGS
    // ==========================================

    @Transactional
    public AdminSetting resetSettings() {

        AdminSetting settings = adminSettingRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(AdminSetting::new);

        settings.setBusinessName("AutoGlow");
        settings.setBusinessEmail(null);
        settings.setBusinessPhone(null);
        settings.setBusinessAddress(null);
        settings.setCurrency("INR");
        settings.setTimezone("Asia/Kolkata");

        settings.setAllowOnlineBooking(true);
        settings.setAutoConfirmBooking(false);
        settings.setAllowPickupDrop(true);
        settings.setAdvanceBookingDays(30);
        settings.setCancellationHours(4);

        settings.setEmailNotifications(true);
        settings.setBookingNotifications(true);
        settings.setPaymentNotifications(true);
        settings.setReviewNotifications(true);
        settings.setSystemNotifications(true);

        settings.setTwoFactorAuth(false);
        settings.setLoginAlerts(true);
        settings.setSessionTimeout(30);

        return adminSettingRepository.save(settings);
    }

    // ==========================================
    // CREATE DEFAULT SETTINGS
    // ==========================================

    private AdminSetting createDefaultSettings() {

        AdminSetting settings = new AdminSetting();

        settings.setBusinessName("AutoGlow");
        settings.setCurrency("INR");
        settings.setTimezone("Asia/Kolkata");

        settings.setAllowOnlineBooking(true);
        settings.setAutoConfirmBooking(false);
        settings.setAllowPickupDrop(true);
        settings.setAdvanceBookingDays(30);
        settings.setCancellationHours(4);

        settings.setEmailNotifications(true);
        settings.setBookingNotifications(true);
        settings.setPaymentNotifications(true);
        settings.setReviewNotifications(true);
        settings.setSystemNotifications(true);

        settings.setTwoFactorAuth(false);
        settings.setLoginAlerts(true);
        settings.setSessionTimeout(30);

        return adminSettingRepository.save(settings);
    }
}