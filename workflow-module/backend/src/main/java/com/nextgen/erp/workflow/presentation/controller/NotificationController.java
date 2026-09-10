package com.nextgen.erp.workflow.presentation.controller;

import com.nextgen.erp.workflow.domain.model.InAppNotification;
import com.nextgen.erp.workflow.domain.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping("/{username}")
    public ResponseEntity<List<InAppNotification>> getUserNotifications(@PathVariable String username) {
        return ResponseEntity.ok(notificationRepository.findByUsernameOrderByCreatedAtDesc(username));
    }

    @GetMapping("/{username}/unread")
    public ResponseEntity<List<InAppNotification>> getUnreadNotifications(@PathVariable String username) {
        return ResponseEntity.ok(notificationRepository.findByUsernameAndIsReadFalseOrderByCreatedAtDesc(username));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<InAppNotification> markAsRead(@PathVariable UUID id) {
        return notificationRepository.findById(id).map(notification -> {
            notification.setIsRead(true);
            return ResponseEntity.ok(notificationRepository.save(notification));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{username}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String username) {
        List<InAppNotification> unread = notificationRepository.findByUsernameAndIsReadFalseOrderByCreatedAtDesc(username);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
        return ResponseEntity.ok().build();
    }
}
