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
    private final AppRoleRepository roleRepository;
    private final AppUserRepository userRepository;
    private final DocumentTemplateRepository documentTemplateRepository;

    @Override
    public void run(String... args) throws Exception {
        seedRolesAndUsers();
        seedMasterStates();
        seedDocumentTemplates();
        seedWorkflowsAndDocuments();
    }

    private void seedRolesAndUsers() {
        List<String> defaultRoles = List.of("ADMIN", "MANAGER", "EMPLOYEE", "HR_MANAGER", "FINANCE");
        for (String roleName : defaultRoles) {
            if (roleRepository.findByRoleNameIgnoreCase(roleName).isEmpty()) {
                roleRepository.save(AppRole.builder().roleName(roleName).build());
                log.info("Seeded Role: {}", roleName);
            }
        }

        AppRole adminRole = roleRepository.findByRoleNameIgnoreCase("ADMIN").orElse(null);
        AppRole managerRole = roleRepository.findByRoleNameIgnoreCase("MANAGER").orElse(null);
        AppRole employeeRole = roleRepository.findByRoleNameIgnoreCase("EMPLOYEE").orElse(null);
        AppRole hrRole = roleRepository.findByRoleNameIgnoreCase("HR_MANAGER").orElse(null);
        AppRole financeRole = roleRepository.findByRoleNameIgnoreCase("FINANCE").orElse(null);

        seedUser("admin_user", java.util.Set.of(adminRole, managerRole));
        seedUser("employee_user", java.util.Set.of(employeeRole));
        seedUser("hr_user", java.util.Set.of(hrRole, employeeRole));
        seedUser("finance_user", java.util.Set.of(financeRole, managerRole));
    }

    private void seedUser(String username, java.util.Set<AppRole> roles) {
        if (userRepository.findByUsername(username).isEmpty()) {
            java.util.Set<AppRole> validRoles = roles.stream()
                    .filter(java.util.Objects::nonNull)
                    .collect(java.util.stream.Collectors.toSet());
            userRepository.save(AppUser.builder()
                    .username(username)
                    .roles(validRoles)
                    .build());
            log.info("Seeded User: {}", username);
        }
    }

    private void seedMasterStates() {
        java.util.Map<String, String> stateColors = java.util.Map.ofEntries(
            java.util.Map.entry("Draft", "#94a3b8"),
            java.util.Map.entry("Pending Approval", "#f59e0b"),
            java.util.Map.entry("Approved", "#10b981"),
            java.util.Map.entry("Rejected", "#ef4444"),
            java.util.Map.entry("Manager Review", "#3b82f6"),
            java.util.Map.entry("HR Review", "#8b5cf6"),
            java.util.Map.entry("Finance Approval", "#6366f1"),
            java.util.Map.entry("Audit Verification", "#06b6d4"),
            java.util.Map.entry("Payment Processing", "#d97706"),
            java.util.Map.entry("Paid", "#059669"),
            java.util.Map.entry("Flagged", "#dc2626")
        );

        for (var entry : stateColors.entrySet()) {
            String stateName = entry.getKey();
            String color = entry.getValue();
            var existing = masterRepository.findByStateNameIgnoreCase(stateName);
            if (existing.isEmpty()) {
                masterRepository.save(WorkflowStateMaster.builder()
                        .stateName(stateName)
                        .colorCode(color)
                        .description("System seeded state: " + stateName)
                        .build());
                log.info("Seeded Master State: {}", stateName);
            } else {
                WorkflowStateMaster m = existing.get();
                if (m.getColorCode() == null || m.getColorCode().isEmpty()) {
                    m.setColorCode(color);
                    masterRepository.save(m);
                }
            }
        }
    }

    private void seedDocumentTemplates() {
        if (documentTemplateRepository.count() == 0) {
            documentTemplateRepository.save(DocumentTemplate.builder()
                    .name("Standard Purchase Order Template")
                    .documentType("PurchaseOrder")
                    .category("Procurement")
                    .createdBy("admin_user")
                    .isActive(true)
                    .htmlContent("<h2>Purchase Order Details</h2><p>Items, quantities, and vendor information.</p>")
                    .build());

            documentTemplateRepository.save(DocumentTemplate.builder()
                    .name("Employee Leave Application Template")
                    .documentType("LeaveRequest")
                    .category("Human Resources")
                    .createdBy("hr_user")
                    .isActive(true)
                    .htmlContent("<h2>Leave Application</h2><p>Dates, leave type, and manager approval section.</p>")
                    .build());

            documentTemplateRepository.save(DocumentTemplate.builder()
                    .name("Travel & Expense Claim Template")
                    .documentType("ExpenseClaim")
                    .category("Finance")
                    .createdBy("finance_user")
                    .isActive(true)
                    .htmlContent("<h2>Expense Report</h2><p>Itemized travel expenses and receipt attachments.</p>")
                    .build());

            log.info("Seeded Document Templates.");
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
