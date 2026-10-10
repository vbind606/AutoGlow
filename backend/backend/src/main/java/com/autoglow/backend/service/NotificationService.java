package com.autoglow.backend.service;

import com.autoglow.backend.dto.NotificationResponse;
import com.autoglow.backend.entity.Notification;
import com.autoglow.backend.entity.User;
import com.autoglow.backend.repository.NotificationRepository;
import com.autoglow.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // Get all notifications of logged-in user
    public List<NotificationResponse> getMyNotifications(String email) {

        User user = getUser(email);

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Get unread notifications
    public List<NotificationResponse> getUnreadNotifications(String email) {

        User user = getUser(email);

        return notificationRepository
                .findByUserAndReadFalseOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Get unread notification count
    public long getUnreadCount(String email) {

        User user = getUser(email);

        return notificationRepository.countByUserAndReadFalse(user);
    }

    // Mark one notification as read
    public NotificationResponse markAsRead(Long id, String email) {

        User user = getUser(email);

        Notification notification = notificationRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);

        return toResponse(notificationRepository.save(notification));
    }

    // Mark all notifications as read
    public void markAllAsRead(String email) {

        User user = getUser(email);

        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);

        for (Notification notification : notifications) {
            notification.setRead(true);
        }

        notificationRepository.saveAll(notifications);
    }

    // Delete notification
    public void deleteNotification(Long id, String email) {

        User user = getUser(email);

        Notification notification = notificationRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notificationRepository.delete(notification);
    }

    // Create notification for any user
    public NotificationResponse createNotification(
            Long userId,
            String title,
            String message,
            String type,
            Long referenceId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setRead(false);

        return toResponse(notificationRepository.save(notification));
    }

    // Common user lookup
    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Entity → DTO
    private NotificationResponse toResponse(Notification notification) {

        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getReferenceId(),
                notification.isRead(),
                notification.getCreatedAt());
    }
}