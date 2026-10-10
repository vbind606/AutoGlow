package com.autoglow.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
public class Booking {

    // ==========================================
    // PRIMARY KEY
    // ==========================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // CUSTOMER / USER
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ==========================================
    // VEHICLE
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    // ==========================================
    // WORKER
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id")
    private Worker worker;

    // ==========================================
    // SERVICE
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private ServiceEntity service;

    // ==========================================
    // SERVICE PACKAGE
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id")
    private ServicePackage servicePackage;

    // ==========================================
    // BOOKING DATE
    // ==========================================

    @Column(nullable = false)
    private LocalDate bookingDate;

    // ==========================================
    // BOOKING TIME
    // ==========================================

    @Column(nullable = false)
    private LocalTime bookingTime;

    // ==========================================
    // PICKUP / DROP
    // ==========================================

    private boolean pickupRequired;

    private boolean dropRequired;

    private String pickupAddress;

    private String dropAddress;

    // ==========================================
    // TOTAL AMOUNT
    // ==========================================

    private Double totalAmount;

    // ==========================================
    // BOOKING STATUS
    // ==========================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    // ==========================================
    // NOTES
    // ==========================================

    private String notes;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    public Booking() {
    }

    // ==========================================
    // GET ID
    // ==========================================

    public Long getId() {
        return id;
    }

    // ==========================================
    // USER
    // ==========================================

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // ==========================================
    // VEHICLE
    // ==========================================

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    // ==========================================
    // WORKER
    // ==========================================

    public Worker getWorker() {
        return worker;
    }

    public void setWorker(Worker worker) {
        this.worker = worker;
    }

    // ==========================================
    // SERVICE
    // ==========================================

    public ServiceEntity getService() {
        return service;
    }

    public void setService(ServiceEntity service) {
        this.service = service;
    }

    // ==========================================
    // SERVICE PACKAGE
    // ==========================================

    public ServicePackage getServicePackage() {
        return servicePackage;
    }

    public void setServicePackage(ServicePackage servicePackage) {
        this.servicePackage = servicePackage;
    }

    // ==========================================
    // BOOKING DATE
    // ==========================================

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    // ==========================================
    // BOOKING TIME
    // ==========================================

    public LocalTime getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(LocalTime bookingTime) {
        this.bookingTime = bookingTime;
    }

    // ==========================================
    // PICKUP REQUIRED
    // ==========================================

    public boolean isPickupRequired() {
        return pickupRequired;
    }

    public void setPickupRequired(boolean pickupRequired) {
        this.pickupRequired = pickupRequired;
    }

    // ==========================================
    // DROP REQUIRED
    // ==========================================

    public boolean isDropRequired() {
        return dropRequired;
    }

    public void setDropRequired(boolean dropRequired) {
        this.dropRequired = dropRequired;
    }

    // ==========================================
    // PICKUP ADDRESS
    // ==========================================

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    // ==========================================
    // DROP ADDRESS
    // ==========================================

    public String getDropAddress() {
        return dropAddress;
    }

    public void setDropAddress(String dropAddress) {
        this.dropAddress = dropAddress;
    }

    // ==========================================
    // TOTAL AMOUNT
    // ==========================================

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    // ==========================================
    // STATUS
    // ==========================================

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    // ==========================================
    // NOTES
    // ==========================================

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}