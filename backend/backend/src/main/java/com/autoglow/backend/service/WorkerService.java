package com.autoglow.backend.service;

import com.autoglow.backend.dto.WorkerCreateRequest;
import com.autoglow.backend.entity.Role;
import com.autoglow.backend.entity.User;
import com.autoglow.backend.entity.Worker;
import com.autoglow.backend.repository.UserRepository;
import com.autoglow.backend.repository.WorkerRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkerService {

    private final WorkerRepository workerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public WorkerService(
            WorkerRepository workerRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.workerRepository = workerRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================================================
    // ADMIN - GET ALL WORKERS
    // =========================================================

    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }

    // =========================================================
    // ADMIN - GET ACTIVE WORKERS
    // =========================================================

    public List<Worker> getActiveWorkers() {
        return workerRepository.findByActiveTrue();
    }

    // =========================================================
    // GET WORKER BY ID
    // =========================================================

    public Worker getWorkerById(Long id) {

        return workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
    }

    // =========================================================
    // GET WORKER BY EMAIL
    // Used by Worker Profile / Sidebar / Header
    // =========================================================

    public Worker getWorkerByEmail(String email) {

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Worker email is required");
        }

        return workerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
    }

    // =========================================================
    // CREATE WORKER + LOGIN ACCOUNT
    // =========================================================

    public Worker createWorker(WorkerCreateRequest request) {

        if (request.getEmail() == null ||
                request.getEmail().trim().isEmpty()) {

            throw new RuntimeException("Worker email is required");
        }

        if (workerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "Worker email already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "Email already registered");
        }

        if (request.getPassword() == null ||
                request.getPassword().trim().isEmpty()) {

            throw new RuntimeException(
                    "Password is required");
        }

        // -----------------------------------------------------
        // CREATE WORKER
        // -----------------------------------------------------

        Worker worker = new Worker();

        worker.setName(request.getName());
        worker.setEmail(request.getEmail());
        worker.setPhone(request.getPhone());
        worker.setSpecialization(
                request.getSpecialization());

        worker.setActive(true);

        Worker savedWorker = workerRepository.save(worker);

        // -----------------------------------------------------
        // CREATE LOGIN USER
        // -----------------------------------------------------

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // NEVER store plain password
        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()));

        user.setRole(Role.WORKER);

        userRepository.save(user);

        return savedWorker;
    }

    // =========================================================
    // ADMIN - UPDATE WORKER
    // =========================================================

    public Worker updateWorker(
            Long id,
            WorkerCreateRequest request) {

        Worker existingWorker = getWorkerById(id);

        String oldEmail = existingWorker.getEmail();
        String newEmail = request.getEmail();

        // -----------------------------------------------------
        // EMAIL CHANGE CHECK
        // -----------------------------------------------------

        if (newEmail == null ||
                newEmail.trim().isEmpty()) {

            throw new RuntimeException(
                    "Worker email is required");
        }

        if (!oldEmail.equalsIgnoreCase(newEmail)) {

            if (workerRepository.existsByEmail(newEmail)) {
                throw new RuntimeException(
                        "Worker email already exists");
            }

            if (userRepository.existsByEmail(newEmail)) {
                throw new RuntimeException(
                        "Email already registered");
            }
        }

        // -----------------------------------------------------
        // UPDATE WORKER
        // -----------------------------------------------------

        existingWorker.setName(request.getName());
        existingWorker.setEmail(newEmail);
        existingWorker.setPhone(request.getPhone());
        existingWorker.setSpecialization(
                request.getSpecialization());

        Worker savedWorker = workerRepository.save(existingWorker);

        // -----------------------------------------------------
        // UPDATE LOGIN USER
        // -----------------------------------------------------

        User user = userRepository.findByEmail(oldEmail)
                .orElse(null);

        if (user != null) {

            user.setName(request.getName());
            user.setEmail(newEmail);

            // Role must remain WORKER
            user.setRole(Role.WORKER);

            // Password changes only when admin
            // enters a new password
            if (request.getPassword() != null &&
                    !request.getPassword()
                            .trim()
                            .isEmpty()) {

                user.setPassword(
                        passwordEncoder.encode(
                                request.getPassword()));
            }

            userRepository.save(user);
        }

        return savedWorker;
    }

    // =========================================================
    // DELETE WORKER
    // =========================================================

    public void deleteWorker(Long id) {

        Worker worker = getWorkerById(id);

        String email = worker.getEmail();

        // Delete worker record
        workerRepository.delete(worker);

        // Delete corresponding login account
        userRepository.findByEmail(email)
                .ifPresent(user -> userRepository.delete(user));
    }

    // =========================================================
    // TOGGLE ACTIVE / INACTIVE
    // =========================================================

    public Worker toggleWorker(Long id) {

        Worker worker = getWorkerById(id);

        worker.setActive(!worker.isActive());

        return workerRepository.save(worker);
    }
}