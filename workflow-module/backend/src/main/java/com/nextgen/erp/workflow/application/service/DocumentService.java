package com.nextgen.erp.workflow.application.service;

import com.nextgen.erp.workflow.domain.model.Document;
import com.nextgen.erp.workflow.domain.model.WorkflowHistory;
import com.nextgen.erp.workflow.domain.model.WorkflowState;
import com.nextgen.erp.workflow.domain.model.WorkflowTransition;
import com.nextgen.erp.workflow.domain.repository.DocumentRepository;
import com.nextgen.erp.workflow.domain.repository.WorkflowHistoryRepository;
import com.nextgen.erp.workflow.domain.repository.WorkflowStateRepository;
import com.nextgen.erp.workflow.domain.repository.WorkflowTransitionRepository;
import com.nextgen.erp.workflow.domain.repository.WorkflowRepository;
import com.nextgen.erp.workflow.domain.repository.DocumentTemplateRepository;
import com.nextgen.erp.workflow.domain.repository.AppUserRepository;
import com.nextgen.erp.workflow.api.dto.DocumentResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.SimpleEvaluationContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

import com.nextgen.erp.workflow.domain.repository.DelegationRepository;
import com.nextgen.erp.workflow.domain.model.Delegation;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final WorkflowTransitionRepository transitionRepository;
    private final WorkflowHistoryRepository historyRepository;
    private final WorkflowStateRepository stateRepository;
    private final WorkflowRepository workflowRepository;
    private final DocumentTemplateRepository templateRepository;
    private final AppUserRepository userRepository;
    private final NotificationService notificationService;
    private final DelegationRepository delegationRepository;
    private final OcrExtractionService ocrExtractionService;

    public DocumentResponseDTO toDto(Document doc) {
        WorkflowState state = doc.getCurrentStateId() != null ? stateRepository.findById(doc.getCurrentStateId()).orElse(null) : null;
        com.nextgen.erp.workflow.domain.model.Workflow workflow = doc.getWorkflowId() != null ? workflowRepository.findById(doc.getWorkflowId()).orElse(null) : null;
        com.nextgen.erp.workflow.domain.model.DocumentTemplate template = doc.getTemplateId() != null ? templateRepository.findById(doc.getTemplateId()).orElse(null) : null;
        return toDto(doc, state, workflow, template);
    }

    public DocumentResponseDTO toDto(Document doc, WorkflowState state, com.nextgen.erp.workflow.domain.model.Workflow workflow, com.nextgen.erp.workflow.domain.model.DocumentTemplate template) {
        return DocumentResponseDTO.builder()
                .id(doc.getId())
                .documentNumber(doc.getDocumentNumber())
                .title(doc.getTitle())
                .documentType(doc.getDocumentType())
                .templateId(doc.getTemplateId())
                .templateName(template != null ? template.getName() : null)
                .workflowId(doc.getWorkflowId())
                .workflowName(workflow != null ? workflow.getWorkflowName() : null)
                .currentStateId(doc.getCurrentStateId())
                .currentStateName(state != null ? state.getStateName() : null)
                .currentStateColor(state != null ? state.getColorCode() : null)
                .status(doc.getStatus())
                .amount(doc.getAmount())
                .contentHtml(doc.getContentHtml())
                .gcsAttachmentUrl(doc.getGcsAttachmentUrl())
                .ownerUsername(doc.getOwnerUsername())
                .assignedUsername(doc.getAssignedUsername())
                .createdAt(doc.getCreatedAt())
                .updatedAt(doc.getUpdatedAt())
                .version(doc.getVersion())
                .clarificationRequestedBy(doc.getClarificationRequestedBy())
                .clarificationReturnStateId(doc.getClarificationReturnStateId())
                .furthestStateId(doc.getFurthestStateId())
                .parentDocumentId(doc.getParentDocumentId())
                .childWorkflowId(doc.getChildWorkflowId())
                .build();
    }

    public Page<DocumentResponseDTO> mapPageToDto(Page<Document> page) {
        if (page.isEmpty()) return Page.empty(page.getPageable());
        
        List<UUID> stateIds = page.getContent().stream().map(Document::getCurrentStateId).filter(java.util.Objects::nonNull).distinct().toList();
        List<UUID> workflowIds = page.getContent().stream().map(Document::getWorkflowId).filter(java.util.Objects::nonNull).distinct().toList();
        List<UUID> templateIds = page.getContent().stream().map(Document::getTemplateId).filter(java.util.Objects::nonNull).distinct().toList();

        java.util.Map<UUID, WorkflowState> stateMap = stateIds.isEmpty() ? java.util.Collections.emptyMap() :
                stateRepository.findAllById(stateIds).stream().collect(Collectors.toMap(WorkflowState::getId, s -> s));
        java.util.Map<UUID, com.nextgen.erp.workflow.domain.model.Workflow> workflowMap = workflowIds.isEmpty() ? java.util.Collections.emptyMap() :
                workflowRepository.findAllById(workflowIds).stream().collect(Collectors.toMap(w -> w.getId(), w -> w));
        java.util.Map<UUID, com.nextgen.erp.workflow.domain.model.DocumentTemplate> templateMap = templateIds.isEmpty() ? java.util.Collections.emptyMap() :
                templateRepository.findAllById(templateIds).stream().collect(Collectors.toMap(t -> t.getId(), t -> t));

        return page.map(doc -> toDto(doc, 
                doc.getCurrentStateId() != null ? stateMap.get(doc.getCurrentStateId()) : null,
                doc.getWorkflowId() != null ? workflowMap.get(doc.getWorkflowId()) : null,
                doc.getTemplateId() != null ? templateMap.get(doc.getTemplateId()) : null));
    }

    public List<DocumentResponseDTO> mapListToDto(List<Document> list) {
        if (list.isEmpty()) return java.util.Collections.emptyList();

        List<UUID> stateIds = list.stream().map(Document::getCurrentStateId).filter(java.util.Objects::nonNull).distinct().toList();
        List<UUID> workflowIds = list.stream().map(Document::getWorkflowId).filter(java.util.Objects::nonNull).distinct().toList();
        List<UUID> templateIds = list.stream().map(Document::getTemplateId).filter(java.util.Objects::nonNull).distinct().toList();

        java.util.Map<UUID, WorkflowState> stateMap = stateIds.isEmpty() ? java.util.Collections.emptyMap() :
                stateRepository.findAllById(stateIds).stream().collect(Collectors.toMap(WorkflowState::getId, s -> s));
        java.util.Map<UUID, com.nextgen.erp.workflow.domain.model.Workflow> workflowMap = workflowIds.isEmpty() ? java.util.Collections.emptyMap() :
                workflowRepository.findAllById(workflowIds).stream().collect(Collectors.toMap(w -> w.getId(), w -> w));
        java.util.Map<UUID, com.nextgen.erp.workflow.domain.model.DocumentTemplate> templateMap = templateIds.isEmpty() ? java.util.Collections.emptyMap() :
                templateRepository.findAllById(templateIds).stream().collect(Collectors.toMap(t -> t.getId(), t -> t));

        return list.stream().map(doc -> toDto(doc,
                doc.getCurrentStateId() != null ? stateMap.get(doc.getCurrentStateId()) : null,
                doc.getWorkflowId() != null ? workflowMap.get(doc.getWorkflowId()) : null,
                doc.getTemplateId() != null ? templateMap.get(doc.getTemplateId()) : null)).toList();
    }

    public Page<DocumentResponseDTO> getAllDocuments(String searchQuery, Pageable pageable) {
        if (searchQuery != null && !searchQuery.isBlank()) {
            return mapPageToDto(documentRepository.searchDocuments(searchQuery, pageable));
        }
        return mapPageToDto(documentRepository.findAll(pageable));
    }

    public Page<DocumentResponseDTO> getKanbanDocuments(UUID stateId, String stateName, String search, Pageable pageable) {
        return mapPageToDto(documentRepository.findByStateOrStatusAndSearch(stateId, stateName, search, pageable));
    }

    public Optional<DocumentResponseDTO> getDocumentById(UUID id) {
        return documentRepository.findById(id).map(this::toDto);
    }

    @Transactional
    public DocumentResponseDTO createDocument(Document document) {
        if (document.getDocumentNumber() == null) {
            document.setDocumentNumber("DOC-" + System.currentTimeMillis() + "-" + java.util.UUID.randomUUID().toString().substring(0, 4));
        }

        // Auto-fill template HTML if templateId is specified and contentHtml is empty
        if (document.getTemplateId() != null && (document.getContentHtml() == null || document.getContentHtml().isBlank())) {
            templateRepository.findById(document.getTemplateId()).ifPresent(tmpl -> {
                document.setContentHtml(tmpl.getHtmlContent());
                if (document.getDocumentType() == null || document.getDocumentType().isBlank()) {
                    document.setDocumentType(tmpl.getDocumentType());
                }
            });
        }

        // Automatic Workflow Assignment (picking latest active workflow version)
        if (document.getDocumentType() != null) {
            workflowRepository.findFirstByDocumentTypeAndIsActiveTrueOrderByVersionDesc(document.getDocumentType())
                    .ifPresent(workflow -> {
                        document.setWorkflowId(workflow.getId());
                        
                        // Assign initial state
                        stateRepository.findFirstByWorkflowIdAndIsInitialStateTrue(workflow.getId())
                                .ifPresent(initialState -> {
                                    document.setCurrentStateId(initialState.getId());
                                    
                                    // Apply any update fields logic from the initial state
                                    if (initialState.getUpdateFields() != null && !initialState.getUpdateFields().isEmpty()) {
                                        if (initialState.getUpdateFields().containsKey("status")) {
                                            document.setStatus((String) initialState.getUpdateFields().get("status"));
                                        }
                                    }
                                });
                    });
        }
        // OCR Auto-Extraction if amount is missing and contentHtml is available
        if (document.getAmount() == null && document.getContentHtml() != null && !document.getContentHtml().isBlank()) {
            java.util.Map<String, Object> ocrData = ocrExtractionService.extractDataFromText(document.getContentHtml());
            if (ocrData.containsKey("amount")) {
                document.setAmount((Double) ocrData.get("amount"));
            }
        }

        document.setStateUpdatedAt(java.time.LocalDateTime.now());

        return toDto(documentRepository.save(document));
    }

    @Transactional
    public DocumentResponseDTO updateDocument(UUID id, Document updatedDocument, String userRole) {
        return documentRepository.findById(id)
                .map(doc -> {
                    // Check if role is allowed to edit in current state
                    if (doc.getCurrentStateId() != null && !"SYSTEM".equals(userRole)) {
                        stateRepository.findById(doc.getCurrentStateId()).ifPresent(state -> {
                            if (state.getAllowEditRole() != null && !state.getAllowEditRole().isEmpty() && !state.getAllowEditRole().equalsIgnoreCase(userRole)) {
                                throw new RuntimeException("Role " + userRole + " is not allowed to edit document in state " + state.getStateName());
                            }
                        });
                    }

                    if (updatedDocument.getTitle() != null) doc.setTitle(updatedDocument.getTitle());
                    if (updatedDocument.getContentHtml() != null) doc.setContentHtml(updatedDocument.getContentHtml());
                    if (updatedDocument.getAmount() != null) doc.setAmount(updatedDocument.getAmount());
                    if (updatedDocument.getGcsAttachmentUrl() != null) doc.setGcsAttachmentUrl(updatedDocument.getGcsAttachmentUrl());
                    
                    return toDto(documentRepository.save(doc));
                })
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }

    @Transactional
    public DocumentResponseDTO transitionDocument(UUID documentId, String action, String userRole, String username, String comments) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Check for active Out-of-Office Delegation
        String effectiveUser = username;
        if (username != null && !username.isBlank()) {
            List<Delegation> delegations = delegationRepository.findActiveDelegationsForDelegatee(username, LocalDateTime.now());
            if (!delegations.isEmpty()) {
                String delegator = delegations.get(0).getDelegatorUsername();
                log.info("User {} is acting on delegated authority from {}", username, delegator);
            }
        }

        // Validate user role against DB if username is provided
        if (username != null && !username.isBlank() && !"SYSTEM".equalsIgnoreCase(username)) {
            com.nextgen.erp.workflow.domain.model.AppUser appUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User '" + username + "' not found."));
            boolean hasRole = appUser.getRoles().stream()
                    .anyMatch(r -> r.getRoleName().equalsIgnoreCase(userRole) || "ADMIN".equalsIgnoreCase(r.getRoleName()));
            if (!hasRole) {
                throw new RuntimeException("User '" + username + "' does not possess role '" + userRole + "' required for this transition.");
            }
        }

        // Feature D: "Request Clarification" loop handling
        if ("request_clarification".equalsIgnoreCase(action) || "Request Clarification".equalsIgnoreCase(action)) {
            document.setClarificationReturnStateId(document.getCurrentStateId());
            document.setClarificationRequestedBy(username);
            document.setAssignedUsername(document.getOwnerUsername() != null ? document.getOwnerUsername() : username);
            document.setStatus("Clarification Requested");
            document.setStateUpdatedAt(LocalDateTime.now());

            WorkflowHistory history = WorkflowHistory.builder()
                    .documentId(documentId)
                    .actionName("Request Clarification")
                    .fromStateId(document.getCurrentStateId())
                    .toStateId(document.getCurrentStateId())
                    .performedBy(username)
                    .comments(comments != null && !comments.isBlank() ? comments : "Clarification requested from document owner.")
                    .build();
            historyRepository.save(history);

            if (document.getOwnerUsername() != null) {
                notificationService.sendNotification(document.getOwnerUsername() + "@example.com",
                        "Clarification Requested",
                        "Approver " + username + " requested clarification on document " + document.getDocumentNumber() + ": " + comments);
            }

            return toDto(documentRepository.save(document));
        }

        // Feature D: "Provide Clarification" response handling
        if ("provide_clarification".equalsIgnoreCase(action) || "Provide Clarification".equalsIgnoreCase(action)) {
            if (document.getClarificationReturnStateId() != null) {
                UUID returnStateId = document.getClarificationReturnStateId();
                String reviewer = document.getClarificationRequestedBy();

                document.setCurrentStateId(returnStateId);
                document.setAssignedUsername(reviewer);
                document.setClarificationRequestedBy(null);
                document.setClarificationReturnStateId(null);
                document.setStateUpdatedAt(LocalDateTime.now());

                stateRepository.findById(returnStateId).ifPresent(st -> {
                    if (st.getUpdateFields() != null && st.getUpdateFields().containsKey("status")) {
                        document.setStatus((String) st.getUpdateFields().get("status"));
                    } else {
                        document.setStatus(st.getStateName());
                    }
                });

                WorkflowHistory history = WorkflowHistory.builder()
                        .documentId(documentId)
                        .actionName("Provide Clarification")
                        .fromStateId(returnStateId)
                        .toStateId(returnStateId)
                        .performedBy(username)
                        .comments(comments != null && !comments.isBlank() ? comments : "Clarification response provided.")
                        .build();
                historyRepository.save(history);

                if (reviewer != null) {
                    notificationService.sendNotification(reviewer + "@example.com",
                            "Clarification Provided",
                            "Owner " + username + " has provided clarification for document " + document.getDocumentNumber() + ": " + comments);
                }

                return toDto(documentRepository.save(document));
            }
        }

        UUID currentStateId = document.getCurrentStateId();

        List<WorkflowTransition> validTransitions = transitionRepository.findByWorkflowIdAndActionNameIgnoreCase(document.getWorkflowId(), action).stream()
                .filter(t -> (currentStateId == null || currentStateId.equals(t.getFromStateId()))
                        && (t.getAllowedRole().equalsIgnoreCase(userRole) || "ADMIN".equalsIgnoreCase(userRole)))
                .toList();

        if (validTransitions.isEmpty()) {
            throw new RuntimeException("Invalid transition or permission denied for action: " + action);
        }

        WorkflowTransition transition = validTransitions.get(0);

        // Check self-approval
        if (transition.getAllowSelfApproval() != null && !transition.getAllowSelfApproval()) {
            if (document.getOwnerUsername().equalsIgnoreCase(username) && !"ADMIN".equalsIgnoreCase(userRole)) {
                throw new RuntimeException("Self-approval is not allowed for this transition.");
            }
        }

        // Feature E: Evaluate Condition using SpEL (SimpleEvaluationContext for security)
        if (transition.getConditionExpression() != null && !transition.getConditionExpression().trim().isEmpty()) {
            ExpressionParser parser = new SpelExpressionParser();
            SimpleEvaluationContext context = SimpleEvaluationContext.forReadOnlyDataBinding().build();
            context.setVariable("doc", document);
            context.setVariable("amount", document.getAmount());
            context.setVariable("title", document.getTitle());
            
            String exprStr = transition.getConditionExpression().trim();
            if (exprStr.startsWith("doc.")) {
                exprStr = "#" + exprStr;
            }

            try {
                Boolean result = parser.parseExpression(exprStr).getValue(context, Boolean.class);
                if (result == null || !result) {
                    throw new RuntimeException("Transition condition (" + transition.getConditionExpression() + ") was not met.");
                }
            } catch (Exception e) {
                if (e instanceof RuntimeException) throw (RuntimeException) e;
                throw new RuntimeException("Condition evaluation failed: " + e.getMessage());
            }
        }
        
        // Feature A: Check parallel approvals logic
        boolean actuallyTransition = true;
        WorkflowState currentState = null;
        if (currentStateId != null) {
            currentState = stateRepository.findById(currentStateId).orElse(null);
        }

        if (currentState != null && currentState.getRequiresAllRoles() != null && currentState.getRequiresAllRoles()) {
            if (document.getPendingApprovers() != null && !document.getPendingApprovers().isEmpty()) {
                List<String> pending = new java.util.ArrayList<>(java.util.Arrays.asList(document.getPendingApprovers().split(",")));
                
                if (!pending.contains(userRole)) {
                    throw new RuntimeException("You have already approved this document or your role is not required for this state.");
                }

                pending.remove(userRole);

                if (!pending.isEmpty()) {
                    document.setPendingApprovers(String.join(",", pending));
                    actuallyTransition = false;
                } else {
                    document.setPendingApprovers(null);
                }
            }
        }

        // Record History with Cryptographic Hash
        saveHashedHistory(documentId, actuallyTransition ? action : action + " (Partial)", currentStateId, actuallyTransition ? transition.getToStateId() : currentStateId, username, comments);

        if (actuallyTransition) {
            UUID nextStateId = transition.getToStateId();

            // Phase 1.1: Smart Fast-Forward Rework Path Check
            if ((transition.getIsRework() != null && transition.getIsRework()) || "rework_fast_forward".equalsIgnoreCase(action)) {
                if (document.getFurthestStateId() != null) {
                    log.info("Smart Fast-Forward triggered for Document {}. Fast-forwarding to state {}", document.getDocumentNumber(), document.getFurthestStateId());
                    nextStateId = document.getFurthestStateId();
                    document.setFurthestStateId(null);
                }
            } else if ("reject".equalsIgnoreCase(action) || "return".equalsIgnoreCase(action) || "request_rework".equalsIgnoreCase(action)) {
                if (document.getFurthestStateId() == null) {
                    document.setFurthestStateId(currentStateId);
                }
            }

            // Update Document State
            document.setCurrentStateId(nextStateId);
            document.setStateUpdatedAt(java.time.LocalDateTime.now());
            document.setAssignedUsername(null); // Reset assignment on transition

            // Phase 1.2: Dynamic Workload Balancing (Least-Busy Assignment)
            if (transition.getAllowedRole() != null && !"ADMIN".equalsIgnoreCase(transition.getAllowedRole())) {
                List<com.nextgen.erp.workflow.domain.model.AppUser> candidateUsers = userRepository.findByRoles_RoleName(transition.getAllowedRole());
                if (!candidateUsers.isEmpty()) {
                    String leastBusyUser = candidateUsers.stream()
                        .min(java.util.Comparator.comparingLong(u -> documentRepository.countByAssignedUsernameAndStatusNot(u.getUsername(), "Completed")))
                        .map(com.nextgen.erp.workflow.domain.model.AppUser::getUsername)
                        .orElse(null);
                    if (leastBusyUser != null) {
                        document.setAssignedUsername(leastBusyUser);
                        log.info("Dynamic Workload Balancing assigned document {} to least-busy user {}", document.getDocumentNumber(), leastBusyUser);
                    }
                }
            }

            stateRepository.findById(nextStateId).ifPresent(targetState -> {
                // Initialize pendingApprovers if target state requires multiple roles
                if (targetState.getRequiresAllRoles() != null && targetState.getRequiresAllRoles() 
                    && targetState.getRequiredRoles() != null && !targetState.getRequiredRoles().isEmpty()) {
                    document.setPendingApprovers(targetState.getRequiredRoles());
                } else {
                    document.setPendingApprovers(null);
                }

            // Field updates via JSON Map
            if (targetState.getUpdateFields() != null && !targetState.getUpdateFields().isEmpty()) {
                if (targetState.getUpdateFields().containsKey("status")) {
                    document.setStatus((String) targetState.getUpdateFields().get("status"));
                }
            }

            // In-app Notification
            if (targetState.getSendEmail() != null && targetState.getSendEmail()) {
                notificationService.sendNotification("role_" + userRole + "@example.com", "Document requires attention", "Document " + document.getDocumentNumber() + " is now in state " + targetState.getStateName());
            }
        });

        if (transition.getSendEmailToCreator() != null && transition.getSendEmailToCreator()) {
             notificationService.sendNotification(document.getOwnerUsername() + "@example.com", "Document Update", "Your document " + document.getDocumentNumber() + " was transitioned via action " + action);
        }
        
        } // End of if (actuallyTransition)

        return toDto(documentRepository.save(document));
    }

    public Page<DocumentResponseDTO> getDocumentsPendingApproval(String role, Pageable pageable) {
        List<UUID> statesWaitingForRole = transitionRepository.findByAllowedRole(role).stream()
                .map(WorkflowTransition::getFromStateId)
                .distinct()
                .toList();

        return mapPageToDto(documentRepository.findByCurrentStateIdIn(statesWaitingForRole, pageable));
    }

    public List<DocumentResponseDTO> getDocumentsByUser(String username) {
        return mapListToDto(documentRepository.findByOwnerUsername(username));
    }

    public List<WorkflowHistory> getDocumentHistory(UUID documentId) {
        return historyRepository.findByDocumentIdOrderByCreatedAtDesc(documentId);
    }

    public Page<WorkflowHistory> getAuditLogs(String search, Pageable pageable) {
        return historyRepository.searchAuditLogs(search, pageable);
    }

    public Page<DocumentResponseDTO> getPendingApprovals(List<String> roles, String username, Pageable pageable) {
        if (roles == null || roles.isEmpty()) {
            return Page.empty(pageable);
        }
        Page<Document> documents = documentRepository.findPendingDocumentsForRolesAndUser(roles, username, pageable);
        return mapPageToDto(documents);
    }

    @Transactional
    public void delegateDocument(UUID documentId, String targetUsername, String delegatedBy) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        
        document.setAssignedUsername(targetUsername);
        documentRepository.save(document);

        WorkflowHistory history = WorkflowHistory.builder()
                .documentId(documentId)
                .actionName("Delegated")
                .fromStateId(document.getCurrentStateId())
                .toStateId(document.getCurrentStateId())
                .performedBy(delegatedBy)
                .comments("Delegated to " + targetUsername)
                .build();
        historyRepository.save(history);

        notificationService.sendNotification(targetUsername + "@example.com", "Document Delegated", "Document " + document.getDocumentNumber() + " has been delegated to you.");
    }

    @Transactional
    public void bulkTransitionDocuments(List<UUID> documentIds, String action, String userRole, String username, String comments) {
        for (UUID docId : documentIds) {
            try {
                transitionDocument(docId, action, userRole, username, comments);
            } catch (Exception e) {
                log.error("Failed to transition document {} in bulk action: {}", docId, e.getMessage());
                // We could throw to rollback all, or just continue. For bulk, often we want to continue, 
                // but since it's @Transactional on the method, any throw rolls back everything. Let's throw to ensure atomicity.
                throw new RuntimeException("Bulk action failed on document " + docId + ": " + e.getMessage());
            }
        }
    }

    @Transactional
    public void deleteDocument(UUID id) {
        historyRepository.deleteByDocumentId(id);
        documentRepository.deleteById(id);
    }

    private WorkflowHistory saveHashedHistory(UUID documentId, String actionName, UUID fromStateId, UUID toStateId, String performedBy, String comments) {
        String prevHash = historyRepository.findFirstByDocumentIdOrderByCreatedAtDesc(documentId)
                .map(WorkflowHistory::getCurrentHash)
                .orElse("GENESIS_HASH");

        String currentHash = AuditHashUtil.calculateHash(documentId, actionName, performedBy, prevHash);

        WorkflowHistory history = WorkflowHistory.builder()
                .documentId(documentId)
                .actionName(actionName)
                .fromStateId(fromStateId)
                .toStateId(toStateId)
                .performedBy(performedBy)
                .comments(comments)
                .previousHash(prevHash)
                .currentHash(currentHash)
                .build();

        return historyRepository.save(history);
    }

    public boolean verifyDocumentAuditChain(UUID documentId) {
        List<WorkflowHistory> histories = historyRepository.findByDocumentIdOrderByCreatedAtDesc(documentId);
        if (histories.isEmpty()) return true;

        List<WorkflowHistory> orderedHistories = new java.util.ArrayList<>(histories);
        java.util.Collections.reverse(orderedHistories);
        String expectedPrevHash = "GENESIS_HASH";

        for (WorkflowHistory h : orderedHistories) {
            if (h.getPreviousHash() != null && !expectedPrevHash.equals(h.getPreviousHash())) {
                log.error("Audit integrity broken for document {}: previousHash mismatch", documentId);
                return false;
            }
            String calculated = AuditHashUtil.calculateHash(h.getDocumentId(), h.getActionName(), h.getPerformedBy(), expectedPrevHash);
            if (h.getCurrentHash() != null && !calculated.equals(h.getCurrentHash())) {
                log.error("Audit integrity broken for document {}: currentHash mismatch", documentId);
                return false;
            }
            expectedPrevHash = h.getCurrentHash() != null ? h.getCurrentHash() : calculated;
        }
        return true;
    }
}
