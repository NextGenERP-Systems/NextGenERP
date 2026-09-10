package com.nextgen.erp.workflow.application.service;

public interface NotificationService {
    void sendNotification(String to, String subject, String body);
}
