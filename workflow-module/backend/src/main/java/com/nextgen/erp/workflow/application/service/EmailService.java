package com.nextgen.erp.workflow.application.service;

import com.nextgen.erp.workflow.domain.model.AppUser;
import com.nextgen.erp.workflow.domain.model.InAppNotification;
import com.nextgen.erp.workflow.domain.repository.AppUserRepository;
import com.nextgen.erp.workflow.domain.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final AppUserRepository userRepository;

    /**
     * NoOp Implementation: Mocks sending an email by logging it to the console
     * and saving it as an InAppNotification.
     */
    @Override
    public void sendNotification(String to, String subject, String body) {
        log.info("=== EMAIL SENT (NoOp) ===");
        log.info("To: {}", to);
        log.info("Subject: {}", subject);
        log.info("Body: {}", body);
        log.info("=========================");

        if (to == null || !to.endsWith("@example.com")) return;
        
        String identifier = to.replace("@example.com", "");
        
        if (identifier.startsWith("role_")) {
            String roleName = identifier.substring(5);
            List<AppUser> users = userRepository.findByRoles_RoleName(roleName);
            for (AppUser user : users) {
                saveNotification(user.getUsername(), subject, body);
            }
        } else {
            saveNotification(identifier, subject, body);
        }
    }

    private void saveNotification(String username, String title, String message) {
        InAppNotification notification = InAppNotification.builder()
                .username(username)
                .title(title)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }
}
