package com.autoglow.backend.service;

import com.autoglow.backend.dto.AdminWorkerResponse;
import com.autoglow.backend.entity.Role;
import com.autoglow.backend.entity.User;
import com.autoglow.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminWorkerService {

    private final UserRepository userRepository;

    public AdminWorkerService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<AdminWorkerResponse> getAllWorkers() {

        List<User> workers = userRepository.findAllByRole(Role.WORKER);

        return workers.stream()
                .map(worker -> new AdminWorkerResponse(
                        worker.getId(),
                        worker.getName(),
                        worker.getEmail()))
                .toList();
    }
}