package com.nextgen.erp.workflow.application.service;

import com.nextgen.erp.workflow.domain.model.Document;
import com.nextgen.erp.workflow.domain.model.WorkflowState;
import com.nextgen.erp.workflow.domain.repository.DocumentRepository;
import com.nextgen.erp.workflow.domain.repository.WorkflowStateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowSlaService {

    private final DocumentRepository documentRepository;
    private final WorkflowStateRepository stateRepository;
    private final NotificationService notificationService;

    // Run every hour. For testing, we could run every minute: "0 * * * * *"
    // I'll set it to run every 1 minute for demonstration and testing purposes
    @Scheduled(cron = "0 * * * * *")
    public void checkAndEscalateSLAs() {
        log.info("Running SLA check job...");

        List<Document> allDocuments = documentRepository.findAll();
        for (Document document : allDocuments) {
            if (document.getCurrentStateId() == null || document.getStateUpdatedAt() == null) {
                continue;
            }

            stateRepository.findById(document.getCurrentStateId()).ifPresent(state -> {
                if (state.getSlaDays() != null && state.getSlaDays() > 0) {
                    long daysInState = ChronoUnit.DAYS.between(document.getStateUpdatedAt(), LocalDateTime.now());
                    
                    if (daysInState >= state.getSlaDays()) {
                        String escalationRole = state.getEscalationRole();
                        if (escalationRole != null && !escalationRole.isBlank()) {
                            log.info("Document {} SLA breached. Escalating to role: {}", document.getDocumentNumber(), escalationRole);
                            notificationService.sendNotification("role_" + escalationRole + "@example.com", 
                                    "SLA Breach Escalation", 
                                    "Document " + document.getDocumentNumber() + " has breached SLA in state " + state.getStateName());
                            
                            // Optional: Could also add logic here to auto-transition or update a flag on the document
                        }
                    }
                }
            });
        }
    }
}
