package com.autoglow.backend.service;

import com.autoglow.backend.dto.WorkerProfileResponse;
import com.autoglow.backend.entity.User;
import com.autoglow.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class WorkerProfileService {

    private final UserRepository userRepository;

    public WorkerProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public WorkerProfileResponse getWorkerProfile(Long workerId) {

        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        return new WorkerProfileResponse(
                worker.getId(),
                worker.getName(),
                worker.getEmail(),
                worker.getRole().name()
        );
    }
}