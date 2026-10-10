package com.autoglow.backend.service;

import com.autoglow.backend.dto.AdminReportsResponse;
import com.autoglow.backend.dto.BookingStatusReportResponse;
import com.autoglow.backend.dto.MonthlyReportResponse;
import com.autoglow.backend.dto.ServiceReportResponse;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.BookingStatus;
import com.autoglow.backend.entity.Role;
import com.autoglow.backend.entity.ServiceEntity;
import com.autoglow.backend.repository.BookingRepository;
import com.autoglow.backend.repository.PaymentRepository;
import com.autoglow.backend.repository.UserRepository;
import com.autoglow.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AdminReportsService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public AdminReportsService(
            UserRepository userRepository,
            VehicleRepository vehicleRepository,
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }

    // =========================================================
    // MAIN REPORT
    // =========================================================

    public AdminReportsResponse getReports() {

        AdminReportsResponse response = new AdminReportsResponse();

        // -----------------------------------------------------
        // BASIC COUNTS
        // -----------------------------------------------------

        response.setTotalCustomers(
                userRepository.countByRole(Role.CUSTOMER));

        response.setTotalVehicles(
                vehicleRepository.count());

        List<Booking> bookings = bookingRepository.findAll();

        response.setTotalBookings(
                bookings.size());

        // -----------------------------------------------------
        // BOOKING STATUS COUNTS
        // -----------------------------------------------------

        long completedBookings = countBookingStatus(
                bookings,
                "COMPLETED");

        long pendingBookings = countBookingStatus(
                bookings,
                "PENDING");

        long cancelledBookings = countBookingStatus(
                bookings,
                "CANCELLED");

        response.setCompletedBookings(completedBookings);
        response.setPendingBookings(pendingBookings);
        response.setCancelledBookings(cancelledBookings);

        // -----------------------------------------------------
        // PAYMENT DATA
        // -----------------------------------------------------

        var payments = paymentRepository.findAll();

        response.setTotalPayments(
                payments.size());

        long successfulPayments = payments.stream()
                .filter(payment -> payment.getStatus() != null
                        && payment.getStatus().equalsIgnoreCase("SUCCESS"))
                .count();

        long pendingPayments = payments.stream()
                .filter(payment -> payment.getStatus() != null
                        && payment.getStatus().equalsIgnoreCase("PENDING"))
                .count();

        long failedPayments = payments.stream()
                .filter(payment -> payment.getStatus() != null
                        && payment.getStatus().equalsIgnoreCase("FAILED"))
                .count();

        response.setSuccessfulPayments(successfulPayments);
        response.setPendingPayments(pendingPayments);
        response.setFailedPayments(failedPayments);

        // -----------------------------------------------------
        // REVENUE
        // -----------------------------------------------------

        double paidRevenue = payments.stream()
                .filter(payment -> payment.getStatus() != null
                        && payment.getStatus().equalsIgnoreCase("SUCCESS"))
                .mapToDouble(payment -> safeDouble(payment.getAmount()))
                .sum();

        double pendingRevenue = payments.stream()
                .filter(payment -> payment.getStatus() != null
                        && payment.getStatus().equalsIgnoreCase("PENDING"))
                .mapToDouble(payment -> safeDouble(payment.getAmount()))
                .sum();

        double totalRevenue = paidRevenue + pendingRevenue;

        response.setPaidRevenue(round(paidRevenue));
        response.setPendingRevenue(round(pendingRevenue));
        response.setTotalRevenue(round(totalRevenue));

        // -----------------------------------------------------
        // MONTHLY REPORT
        // -----------------------------------------------------

        response.setMonthlyReports(
                buildMonthlyReports(bookings, payments));

        // -----------------------------------------------------
        // BOOKING STATUS REPORT
        // -----------------------------------------------------

        response.setBookingStatusReports(
                buildBookingStatusReports(bookings));

        // -----------------------------------------------------
        // SERVICE REPORT
        // -----------------------------------------------------

        response.setServiceReports(
                buildServiceReports(bookings));

        return response;
    }

    // =========================================================
    // BOOKING STATUS COUNT
    // =========================================================

    private long countBookingStatus(
            List<Booking> bookings,
            String statusName) {

        return bookings.stream()
                .filter(booking -> booking.getStatus() != null
                        && booking.getStatus()
                                .name()
                                .equalsIgnoreCase(statusName))
                .count();
    }

    // =========================================================
    // MONTHLY REPORT
    // =========================================================

    private List<MonthlyReportResponse> buildMonthlyReports(
            List<Booking> bookings,
            List<?> payments) {

        Map<String, MonthlyData> monthlyData = new LinkedHashMap<>();

        // -----------------------------------------------------
        // Create all 12 months
        // -----------------------------------------------------

        for (Month month : Month.values()) {

            String monthName = month.getDisplayName(
                    TextStyle.SHORT,
                    Locale.ENGLISH);

            monthlyData.put(
                    monthName,
                    new MonthlyData());
        }

        // -----------------------------------------------------
        // Booking count by month
        // -----------------------------------------------------

        for (Booking booking : bookings) {

            LocalDate bookingDate = booking.getBookingDate();

            if (bookingDate == null) {
                continue;
            }

            String monthName = bookingDate.getMonth()
                    .getDisplayName(
                            TextStyle.SHORT,
                            Locale.ENGLISH);

            MonthlyData data = monthlyData.get(monthName);

            if (data != null) {
                data.bookings++;
            }
        }

        // -----------------------------------------------------
        // Revenue by successful payment month
        // -----------------------------------------------------

        for (Object object : payments) {

            if (!(object instanceof com.autoglow.backend.entity.Payment payment)) {
                continue;
            }

            if (payment.getStatus() == null
                    || !payment.getStatus().equalsIgnoreCase("SUCCESS")) {
                continue;
            }

            if (payment.getPaymentDate() == null) {
                continue;
            }

            String monthName = payment.getPaymentDate()
                    .getMonth()
                    .getDisplayName(
                            TextStyle.SHORT,
                            Locale.ENGLISH);

            MonthlyData data = monthlyData.get(monthName);

            if (data != null) {
                data.revenue += safeDouble(payment.getAmount());
            }
        }

        List<MonthlyReportResponse> reports = new ArrayList<>();

        for (Map.Entry<String, MonthlyData> entry : monthlyData.entrySet()) {

            MonthlyData data = entry.getValue();

            reports.add(
                    new MonthlyReportResponse(
                            entry.getKey(),
                            data.bookings,
                            round(data.revenue)));
        }

        return reports;
    }

    // =========================================================
    // BOOKING STATUS REPORT
    // =========================================================

    private List<BookingStatusReportResponse> buildBookingStatusReports(
            List<Booking> bookings) {

        Map<String, Long> statusCounts = new LinkedHashMap<>();

        // -----------------------------------------------------
        // Initialize known statuses first
        // -----------------------------------------------------

        for (BookingStatus status : EnumSet.allOf(BookingStatus.class)) {

            statusCounts.put(
                    status.name(),
                    0L);
        }

        // -----------------------------------------------------
        // Count actual bookings
        // -----------------------------------------------------

        for (Booking booking : bookings) {

            if (booking.getStatus() == null) {
                continue;
            }

            String status = booking.getStatus().name();

            statusCounts.put(
                    status,
                    statusCounts.getOrDefault(status, 0L) + 1);
        }

        // -----------------------------------------------------
        // Percentage
        // -----------------------------------------------------

        long total = bookings.size();

        List<BookingStatusReportResponse> reports = new ArrayList<>();

        for (Map.Entry<String, Long> entry : statusCounts.entrySet()) {

            double percentage = 0.0;

            if (total > 0) {
                percentage = (entry.getValue() * 100.0) / total;
            }

            reports.add(
                    new BookingStatusReportResponse(
                            entry.getKey(),
                            entry.getValue(),
                            round(percentage)));
        }

        return reports;
    }

    // =========================================================
    // SERVICE REPORT
    // =========================================================

    private List<ServiceReportResponse> buildServiceReports(
            List<Booking> bookings) {

        Map<String, ServiceData> serviceData = new LinkedHashMap<>();

        // -----------------------------------------------------
        // Process bookings
        // -----------------------------------------------------

        for (Booking booking : bookings) {

            ServiceEntity service = booking.getService();

            if (service == null) {
                continue;
            }

            String serviceName = service.getName();

            if (serviceName == null || serviceName.isBlank()) {
                serviceName = "Unknown Service";
            }

            ServiceData data = serviceData.computeIfAbsent(
                    serviceName,
                    key -> new ServiceData());

            data.bookingCount++;

            data.revenue += safeDouble(
                    booking.getTotalAmount());
        }

        // -----------------------------------------------------
        // Convert to response
        // -----------------------------------------------------

        List<ServiceReportResponse> reports = new ArrayList<>();

        for (Map.Entry<String, ServiceData> entry : serviceData.entrySet()) {

            ServiceData data = entry.getValue();

            double averageRevenue = 0.0;

            if (data.bookingCount > 0) {
                averageRevenue = data.revenue / data.bookingCount;
            }

            reports.add(
                    new ServiceReportResponse(
                            entry.getKey(),
                            data.bookingCount,
                            round(data.revenue),
                            round(averageRevenue)));
        }

        // Highest booking service first
        reports.sort(
                Comparator.comparingLong(
                        ServiceReportResponse::getBookingCount).reversed());

        return reports;
    }

    // =========================================================
    // SAFE DOUBLE
    // =========================================================

    private double safeDouble(Double value) {

        if (value == null) {
            return 0.0;
        }

        return value;
    }

    // =========================================================
    // ROUND
    // =========================================================

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }

    // =========================================================
    // INTERNAL MONTHLY DATA
    // =========================================================

    private static class MonthlyData {

        long bookings = 0;

        double revenue = 0.0;
    }

    // =========================================================
    // INTERNAL SERVICE DATA
    // =========================================================

    private static class ServiceData {

        long bookingCount = 0;

        double revenue = 0.0;
    }
}