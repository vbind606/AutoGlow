package com.autoglow.backend.repository;

import com.autoglow.backend.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkerRepository extends JpaRepository<Worker, Long> {

    Optional<Worker> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Worker> findByActiveTrue();
}