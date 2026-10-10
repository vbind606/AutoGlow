package com.autoglow.backend.service;

import com.autoglow.backend.dto.AdminDashboardResponse;
import com.autoglow.backend.dto.RecentBookingResponse;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.BookingStatus;
import com.autoglow.backend.entity.Role;
import com.autoglow.backend.repository.BookingRepository;
import com.autoglow.backend.repository.PaymentRepository;
import com.autoglow.backend.repository.UserRepository;
import com.autoglow.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public AdminDashboardService(
            UserRepository userRepository,
            VehicleRepository vehicleRepository,
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository) {

        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }

    public AdminDashboardResponse getDashboard() {

        AdminDashboardResponse response = new AdminDashboardResponse();

        // Total Customers
        response.setTotalCustomers(
                userRepository.countByRole(Role.CUSTOMER));

        // Total Vehicles
        response.setTotalVehicles(
                vehicleRepository.count());

        // Total Bookings
        response.setTotalBookings(
                bookingRepository.count());

        // Total Workers
        response.setActiveWorkers(
                userRepository.countByRole(Role.WORKER));

        // Pending Bookings
        response.setPendingBookings(
                bookingRepository.countByStatus(BookingStatus.PENDING));

        // Completed Bookings
        response.setCompletedBookings(
                bookingRepository.countByStatus(BookingStatus.COMPLETED));

        // Total Revenue
        Double revenue = paymentRepository.sumAmountByStatus("SUCCESS");

        response.setTotalRevenue(
                revenue != null ? revenue : 0.0);

        // Recent Bookings
        List<Booking> bookings = bookingRepository.findTop5ByOrderByIdDesc();

        List<RecentBookingResponse> recentBookings = bookings.stream()
                .map(this::convertBooking)
                .toList();

        response.setRecentBookings(recentBookings);

        return response;
    }

    private RecentBookingResponse convertBooking(Booking booking) {

        String customerName = "Customer";

        if (booking.getUser() != null &&
                booking.getUser().getName() != null) {

            customerName = booking.getUser().getName();
        }

        String vehicleName = "Vehicle";

        /*
         * Vehicle ke exact fields abhi assume nahi kar rahe.
         * Isliye vehicle ka safe display name use kar rahe hain.
         */
        if (booking.getVehicle() != null) {

            vehicleName = "Vehicle #" +
                    booking.getVehicle().getId();
        }

        String bookingDate = "";

        if (booking.getBookingDate() != null) {
            bookingDate = booking.getBookingDate().toString();
        }

        String bookingTime = "";

        if (booking.getBookingTime() != null) {
            bookingTime = booking.getBookingTime().toString();
        }

        String status = "";

        if (booking.getStatus() != null) {
            status = booking.getStatus().name();
        }

        Double totalAmount = booking.getTotalAmount();

        return new RecentBookingResponse(
                booking.getId(),
                customerName,
                vehicleName,
                bookingDate,
                bookingTime,
                status,
                totalAmount);
    }
}