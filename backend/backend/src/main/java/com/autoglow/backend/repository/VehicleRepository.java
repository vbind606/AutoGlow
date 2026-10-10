package com.autoglow.backend.repository;

import com.autoglow.backend.entity.User;
import com.autoglow.backend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByUser(User user);

    List<Vehicle> findByUserOrderByIdDesc(User user);

    long countByUser(User user);
}