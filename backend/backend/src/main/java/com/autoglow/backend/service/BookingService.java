package com.autoglow.backend.service;

import com.autoglow.backend.dto.BookingRequest;
import com.autoglow.backend.entity.Booking;
import com.autoglow.backend.entity.BookingStatus;
import com.autoglow.backend.entity.ServiceEntity;
import com.autoglow.backend.entity.ServicePackage;
import com.autoglow.backend.entity.User;
import com.autoglow.backend.entity.Vehicle;
import com.autoglow.backend.repository.BookingRepository;
import com.autoglow.backend.repository.ServicePackageRepository;
import com.autoglow.backend.repository.ServiceRepository;
import com.autoglow.backend.repository.UserRepository;
import com.autoglow.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

        private final BookingRepository bookingRepository;
        private final UserRepository userRepository;
        private final VehicleRepository vehicleRepository;
        private final ServiceRepository serviceRepository;
        private final ServicePackageRepository packageRepository;
        private final NotificationService notificationService;

        public BookingService(
                        BookingRepository bookingRepository,
                        UserRepository userRepository,
                        VehicleRepository vehicleRepository,
                        ServiceRepository serviceRepository,
                        ServicePackageRepository packageRepository,
                        NotificationService notificationService) {

                this.bookingRepository = bookingRepository;
                this.userRepository = userRepository;
                this.vehicleRepository = vehicleRepository;
                this.serviceRepository = serviceRepository;
                this.packageRepository = packageRepository;
                this.notificationService = notificationService;
        }

        public Booking createBooking(BookingRequest request, String email) {

                // Find logged-in user
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Find selected vehicle
                Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

                // Make sure vehicle belongs to logged-in user
                if (!vehicle.getUser().getId().equals(user.getId())) {
                        throw new RuntimeException(
                                        "You cannot book another user's vehicle");
                }

                Booking booking = new Booking();

                booking.setUser(user);
                booking.setVehicle(vehicle);

                double totalAmount = 0.0;

                // Service
                if (request.getServiceId() != null) {

                        ServiceEntity service = serviceRepository
                                        .findById(request.getServiceId())
                                        .orElseThrow(() -> new RuntimeException("Service not found"));

                        booking.setService(service);

                        if (service.getPrice() != null) {
                                totalAmount += service.getPrice();
                        }
                }

                // Package
                if (request.getPackageId() != null) {

                        ServicePackage servicePackage = packageRepository
                                        .findById(request.getPackageId())
                                        .orElseThrow(() -> new RuntimeException("Package not found"));

                        booking.setServicePackage(servicePackage);

                        if (servicePackage.getPrice() != null) {
                                totalAmount += servicePackage.getPrice();
                        }
                }

                // Booking details
                booking.setTotalAmount(totalAmount);

                booking.setBookingDate(request.getBookingDate());
                booking.setBookingTime(request.getBookingTime());

                booking.setPickupRequired(request.isPickupRequired());
                booking.setDropRequired(request.isDropRequired());

                booking.setPickupAddress(request.getPickupAddress());
                booking.setDropAddress(request.getDropAddress());

                booking.setNotes(request.getNotes());

                // New booking status
                booking.setStatus(BookingStatus.PENDING);

                // Save booking first
                Booking savedBooking = bookingRepository.save(booking);

                // Create notification for customer
                notificationService.createNotification(
                                user.getId(),
                                "Booking Received",
                                "Your AutoGlow service booking #"
                                                + savedBooking.getId()
                                                + " has been successfully created.",
                                "BOOKING",
                                savedBooking.getId());

                return savedBooking;
        }

        public List<Booking> getMyBookings(String email) {

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return bookingRepository
                                .findByUserOrderByBookingDateDescBookingTimeDesc(user);
        }

        public Booking getBookingById(String email, Long bookingId) {

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                // Security check
                if (!booking.getUser().getId().equals(user.getId())) {
                        throw new RuntimeException(
                                        "You cannot access another user's booking");
                }

                return booking;
        }

        public List<Booking> getMyServiceHistory(String email) {

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return bookingRepository
                                .findByUserOrderByBookingDateDescBookingTimeDesc(user);
        }
}