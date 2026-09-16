package com.nextgen.erp.workflow.infrastructure.config;

import com.nextgen.erp.workflow.domain.model.*;
import com.nextgen.erp.workflow.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final WorkflowRepository workflowRepository;
    private final WorkflowStateRepository stateRepository;
    private final WorkflowTransitionRepository transitionRepository;
    private final WorkflowStateMasterRepository masterRepository;
    private final DocumentRepository documentRepository;

    @Override
    public void run(String... args) throws Exception {
        seedMasterStates();
        seedWorkflowsAndDocuments();
    }

    private void seedMasterStates() {
        List<String> defaultStates = List.of(
            "Draft", "Pending Approval", "Approved", "Rejected", 
            "Manager Review", "HR Review", "Finance Approval", 
            "Audit Verification", "Payment Processing", "Paid", "Flagged"
        );

        for (String stateName : defaultStates) {
            if (masterRepository.findByStateNameIgnoreCase(stateName).isEmpty()) {
                masterRepository.save(WorkflowStateMaster.builder()
                        .stateName(stateName)
                        .description("System seeded state: " + stateName)
                        .build());
                log.info("Seeded Master State: {}", stateName);
            }
        }
    }

    private void seedWorkflowsAndDocuments() {
        boolean hasPO = workflowRepository.findAll().stream()
                .anyMatch(w -> "Purchase Order Approval".equalsIgnoreCase(w.getWorkflowName()));

        if (hasPO) {
            log.info("Purchase Order Approval workflow already present. Skipping database seeder.");
            return;
        }

        log.info("Starting rich data seeding for Workflows and Documents...");

        // 1. Purchase Order Approval Workflow
        Workflow poWorkflow = workflowRepository.save(Workflow.builder()
                .workflowName("Purchase Order Approval")
                .documentType("PurchaseOrder")
                .isActive(true)
                .build());

        WorkflowState poDraft = stateRepository.save(WorkflowState.builder()
                .workflowId(poWorkflow.getId())
                .stateName("Draft")
                .colorCode("#94a3b8")
                .isInitialState(true)
                .isFinalState(false)
                .sendEmail(false)
                .build());

        WorkflowState poManager = stateRepository.save(WorkflowState.builder()
                .workflowId(poWorkflow.getId())
                .stateName("Manager Approval")
                .colorCode("#f59e0b")
                .isInitialState(false)
                .isFinalState(false)
                .sendEmail(true)
                .build());

        WorkflowState poFinance = stateRepository.save(WorkflowState.builder()
                .workflowId(poWorkflow.getId())
                .stateName("Finance Approval")
                .colorCode("#8b5cf6")
                .isInitialState(false)
                .isFinalState(false)
                .sendEmail(true)
                .build());

        WorkflowState poCompleted = stateRepository.save(WorkflowState.builder()
                .workflowId(poWorkflow.getId())
                .stateName("Completed")
                .colorCode("#10b981")
                .isInitialState(false)
                .isFinalState(true)
                .sendEmail(true)
                .build());

        WorkflowState poRejected = stateRepository.save(WorkflowState.builder()
                .workflowId(poWorkflow.getId())
                .stateName("Rejected")
                .colorCode("#ef4444")
                .isInitialState(false)
                .isFinalState(true)
                .sendEmail(false)
                .build());

        // PO Transitions
        transitionRepository.save(WorkflowTransition.builder()
                .workflowId(poWorkflow.getId())
                .fromStateId(poDraft.getId())
                .toStateId(poManager.getId())
                .actionName("Submit for Review")
                .allowedRole("EMPLOYEE")
                .allowSelfApproval(true)
                .build());

        transitionRepository.save(WorkflowTransition.builder()
                .workflowId(poWorkflow.getId())
                .fromStateId(poManager.getId())
                .toStateId(poFinance.getId())
                .actionName("Escalate to Finance")
                .allowedRole("ADMIN")
                .conditionExpression("#doc.amount != null && #doc.amount >= 5000")
                .allowSelfApproval(false)
                .build());

        transitionRepository.save(WorkflowTransition.builder()
                .workflowId(poWorkflow.getId())
                .fromStateId(poManager.getId())
                .toStateId(poCompleted.getId())
                .actionName("Approve Order")
                .allowedRole("ADMIN")
                .conditionExpression("#doc.amount == null || #doc.amount < 5000")
                .allowSelfApproval(false)
                .build());

        transitionRepository.save(WorkflowTransition.builder()
                .workflowId(poWorkflow.getId())
                .fromStateId(poFinance.getId())
                .toStateId(poCompleted.getId())
                .actionName("Final Finance Approval")
                .allowedRole("ADMIN")
                .allowSelfApproval(false)
                .build());

        transitionRepository.save(WorkflowTransition.builder()
                .workflowId(poWorkflow.getId())
                .fromStateId(poManager.getId())
                .toStateId(poRejected.getId())
                .actionName("Reject PO")
                .allowedRole("ADMIN")
                .allowSelfApproval(false)
                .build());

        // Seed PO Documents
        createDocument("PO-2026-001", "MacBook Pro M3 Max Procurement", "PurchaseOrder", poWorkflow.getId(), poDraft.getId(), "Draft", 4200.00, "employee_user", "employee_user");
        createDocument("PO-2026-002", "Annual Cloud Server Infrastructure", "PurchaseOrder", poWorkflow.getId(), poManager.getId(), "Manager Approval", 18500.00, "employee_user", "admin_user");
        createDocument("PO-2026-003", "Ergonomic Office Chairs Batch #4", "PurchaseOrder", poWorkflow.getId(), poFinance.getId(), "Finance Approval", 7200.00, "employee_user", "admin_user");
        createDocument("PO-2026-004", "Q3 Marketing Event Venue Reserve", "PurchaseOrder", poWorkflow.getId(), poCompleted.getId(), "Completed", 3500.00, "employee_user", "admin_user");

        // 2. Leave Request Approval Workflow
        Workflow lrWorkflow = workflowRepository.save(Workflow.builder()
                .workflowName("Leave Request Approval")
                .documentType("LeaveRequest")
                .isActive(true)
                .build());

        WorkflowState lrDraft = stateRepository.save(WorkflowState.builder()
                .workflowId(lrWorkflow.getId())
                .stateName("Draft")
                .colorCode("#94a3b8")
                .isInitialState(true)
                .isFinalState(false)
                .sendEmail(false)
                .build());

        WorkflowState lrHR = stateRepository.save(WorkflowState.builder()
                .workflowId(lrWorkflow.getId())
                .stateName("HR Review")
                .colorCode("#3b82f6")
                .isInitialState(false)
                .isFinalState(false)
                .sendEmail(true)
                .build());

        WorkflowState lrApproved = stateRepository.save(WorkflowState.builder()
                .workflowId(lrWorkflow.getId())
                .stateName("Approved")
                .colorCode("#10b981")
                .isInitialState(false)
                .isFinalState(true)
                .sendEmail(true)
                .build());

        WorkflowState lrRejected = stateRepository.save(WorkflowState.builder()
                .workflowId(lrWorkflow.getId())
                .stateName("Rejected")
                .colorCode("#ef4444")
                .isInitialState(false)
                .isFinalState(true)
                .sendEmail(false)
                .build());

        transitionRepository.save(WorkflowTransition.builder()
                .workflowId(lrWorkflow.getId())
                .fromStateId(lrDraft.getId())
                .toStateId(lrHR.getId())
                .actionName("Submit Leave Application")
                .allowedRole("EMPLOYEE")
                .allowSelfApproval(true)
                .build());

        transitionRepository.save(WorkflowTransition.builder()
                .workflowId(lrWorkflow.getId())
                .fromStateId(lrHR.getId())
                .toStateId(lrApproved.getId())
                .actionName("Grant Leave")
                .allowedRole("HR_MANAGER")
                .allowSelfApproval(false)
                .build());

        transitionRepository.save(WorkflowTransition.builder()
                .workflowId(lrWorkflow.getId())
                .fromStateId(lrHR.getId())
                .toStateId(lrRejected.getId())
                .actionName("Decline Leave")
                .allowedRole("HR_MANAGER")
                .allowSelfApproval(false)
                .build());

        createDocument("LR-2026-101", "Annual Medical Leave Application", "LeaveRequest", lrWorkflow.getId(), lrDraft.getId(), "Draft", null, "employee_user", "employee_user");
        createDocument("LR-2026-102", "Paternity Leave Request (14 Days)", "LeaveRequest", lrWorkflow.getId(), lrHR.getId(), "HR Review", null, "employee_user", "hr_user");
        createDocument("LR-2026-103", "Conference Attendance & Travel Leave", "LeaveRequest", lrWorkflow.getId(), lrApproved.getId(), "Approved", null, "employee_user", "hr_user");

        log.info("Data seeding completed successfully!");
    }

    private void createDocument(String number, String title, String type, UUID workflowId, UUID stateId, String status, Double amount, String owner, String assignee) {
        if (documentRepository.findByDocumentNumber(number).isEmpty()) {
            documentRepository.save(Document.builder()
                    .documentNumber(number)
                    .title(title)
                    .documentType(type)
                    .workflowId(workflowId)
                    .currentStateId(stateId)
                    .status(status)
                    .amount(amount)
                    .ownerUsername(owner)
                    .assignedUsername(assignee)
                    .contentHtml("<p>Detailed specifications and notes for " + title + "</p>")
                    .stateUpdatedAt(LocalDateTime.now())
                    .version(1)
                    .build());
        }
    }
}
