package com.nextgen.erp.workflow.application.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    /**
     * Mocks sending an email by logging it to the console.
     */
    public void sendEmail(String to, String subject, String body) {
        log.info("=== EMAIL SENT ===");
        log.info("To: {}", to);
        log.info("Subject: {}", subject);
        log.info("Body: {}", body);
        log.info("==================");
    }
}
