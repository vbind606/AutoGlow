package com.autoglow.backend.service;

import com.autoglow.backend.dto.AdminCustomerResponse;
import com.autoglow.backend.entity.Role;
import com.autoglow.backend.entity.User;
import com.autoglow.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminCustomerService {

    private final UserRepository userRepository;

    public AdminCustomerService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<AdminCustomerResponse> getAllCustomers() {

        List<User> customers = userRepository.findAllByRole(Role.CUSTOMER);

        return customers.stream()
                .map(this::convertToResponse)
                .toList();
    }

    public AdminCustomerResponse getCustomerById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (user.getRole() != Role.CUSTOMER) {
            throw new RuntimeException("User is not a customer");
        }

        return convertToResponse(user);
    }

    private AdminCustomerResponse convertToResponse(User user) {

        return new AdminCustomerResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name());
    }
}