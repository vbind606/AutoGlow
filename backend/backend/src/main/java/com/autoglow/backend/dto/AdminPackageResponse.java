package com.autoglow.backend.dto;

public class AdminPackageResponse {

    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer durationMinutes;
    private String vehicleType;
    private boolean active;

    private Long serviceId;
    private String serviceName;

    public AdminPackageResponse() {
    }

    public AdminPackageResponse(
            Long id,
            String name,
            String description,
            Double price,
            Integer durationMinutes,
            String vehicleType,
            boolean active,
            Long serviceId,
            String serviceName) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.durationMinutes = durationMinutes;
        this.vehicleType = vehicleType;
        this.active = active;
        this.serviceId = serviceId;
        this.serviceName = serviceName;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Double getPrice() {
        return price;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public boolean isActive() {
        return active;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }
}