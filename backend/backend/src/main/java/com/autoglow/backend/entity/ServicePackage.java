package com.autoglow.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "service_packages")
public class ServicePackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================
    // PACKAGE NAME
    // =========================
    @Column(nullable = false)
    private String name;

    // =========================
    // PACKAGE DESCRIPTION
    // =========================
    @Column(length = 1000)
    private String description;

    // =========================
    // PACKAGE PRICE
    // =========================
    @Column(nullable = false)
    private Double price;

    // =========================
    // SERVICE DURATION
    // =========================
    private Integer durationMinutes;

    // =========================
    // VEHICLE TYPE
    // CAR / BIKE / SUV / ALL
    // =========================
    private String vehicleType;

    // =========================
    // PACKAGE STATUS
    // =========================
    private boolean active = true;

    // =========================
    // SERVICE RELATION
    // =========================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private ServiceEntity service;

    // =========================
    // DEFAULT CONSTRUCTOR
    // =========================
    public ServicePackage() {
    }

    // =========================
    // GET ID
    // =========================
    public Long getId() {
        return id;
    }

    // =========================
    // GET NAME
    // =========================
    public String getName() {
        return name;
    }

    // =========================
    // SET NAME
    // =========================
    public void setName(String name) {
        this.name = name;
    }

    // =========================
    // GET DESCRIPTION
    // =========================
    public String getDescription() {
        return description;
    }

    // =========================
    // SET DESCRIPTION
    // =========================
    public void setDescription(String description) {
        this.description = description;
    }

    // =========================
    // GET PRICE
    // =========================
    public Double getPrice() {
        return price;
    }

    // =========================
    // SET PRICE
    // =========================
    public void setPrice(Double price) {
        this.price = price;
    }

    // =========================
    // GET DURATION
    // =========================
    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    // =========================
    // SET DURATION
    // =========================
    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    // =========================
    // GET VEHICLE TYPE
    // =========================
    public String getVehicleType() {
        return vehicleType;
    }

    // =========================
    // SET VEHICLE TYPE
    // =========================
    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    // =========================
    // CHECK ACTIVE
    // =========================
    public boolean isActive() {
        return active;
    }

    // =========================
    // SET ACTIVE
    // =========================
    public void setActive(boolean active) {
        this.active = active;
    }

    // =========================
    // GET SERVICE
    // =========================
    public ServiceEntity getService() {
        return service;
    }

    // =========================
    // SET SERVICE
    // =========================
    public void setService(ServiceEntity service) {
        this.service = service;
    }
}