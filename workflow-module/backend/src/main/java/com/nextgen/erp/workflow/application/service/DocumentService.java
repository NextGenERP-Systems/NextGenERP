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
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

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

    public DocumentResponseDTO toDto(Document doc) {
        return DocumentResponseDTO.builder()
                .id(doc.getId())
                .documentNumber(doc.getDocumentNumber())
                .title(doc.getTitle())
                .documentType(doc.getDocumentType())
                .templateId(doc.getTemplateId())
                .templateName(doc.getTemplateId() != null ? templateRepository.findById(doc.getTemplateId()).map(t -> t.getName()).orElse(null) : null)
                .workflowId(doc.getWorkflowId())
                .workflowName(doc.getWorkflowId() != null ? workflowRepository.findById(doc.getWorkflowId()).map(w -> w.getWorkflowName()).orElse(null) : null)
                .currentStateId(doc.getCurrentStateId())
                .currentStateName(doc.getCurrentStateId() != null ? stateRepository.findById(doc.getCurrentStateId()).map(s -> s.getStateName()).orElse(null) : null)
                .currentStateColor(doc.getCurrentStateId() != null ? stateRepository.findById(doc.getCurrentStateId()).map(s -> s.getColorCode()).orElse(null) : null)
                .status(doc.getStatus())
                .amount(doc.getAmount())
                .contentHtml(doc.getContentHtml())
                .gcsAttachmentUrl(doc.getGcsAttachmentUrl())
                .ownerUsername(doc.getOwnerUsername())
                .assignedUsername(doc.getAssignedUsername())
                .createdAt(doc.getCreatedAt())
                .updatedAt(doc.getUpdatedAt())
                .version(doc.getVersion())
                .build();
    }

    public Page<DocumentResponseDTO> getAllDocuments(String searchQuery, Pageable pageable) {
        if (searchQuery != null && !searchQuery.isBlank()) {
            return documentRepository.searchDocuments(searchQuery, pageable).map(this::toDto);
        }
        return documentRepository.findAll(pageable).map(this::toDto);
    }

    public Page<DocumentResponseDTO> getKanbanDocuments(UUID stateId, String stateName, String search, Pageable pageable) {
        return documentRepository.findByStateOrStatusAndSearch(stateId, stateName, search, pageable).map(this::toDto);
    }

    public Optional<DocumentResponseDTO> getDocumentById(UUID id) {
        return documentRepository.findById(id).map(this::toDto);
    }

    @Transactional
    public DocumentResponseDTO createDocument(Document document) {
        if (document.getDocumentNumber() == null) {
            document.setDocumentNumber("DOC-" + System.currentTimeMillis());
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

        // Automatic Workflow Assignment
        if (document.getDocumentType() != null) {
            workflowRepository.findByDocumentTypeAndIsActiveTrue(document.getDocumentType())
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

        // Validate user role against DB if username is provided
        if (username != null && !username.isBlank() && !"SYSTEM".equalsIgnoreCase(username)) {
            userRepository.findByUsername(username).ifPresent(appUser -> {
                boolean hasRole = appUser.getRoles().stream()
                        .anyMatch(r -> r.getRoleName().equalsIgnoreCase(userRole) || "ADMIN".equalsIgnoreCase(r.getRoleName()));
                if (!hasRole) {
                    throw new RuntimeException("User '" + username + "' does not possess role '" + userRole + "' required for this transition.");
                }
            });
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

        // Evaluate Condition using SpEL
        if (transition.getConditionExpression() != null && !transition.getConditionExpression().trim().isEmpty()) {
            ExpressionParser parser = new SpelExpressionParser();
            StandardEvaluationContext context = new StandardEvaluationContext();
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
        
        // Check parallel approvals logic
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

        // Record History
        WorkflowHistory history = WorkflowHistory.builder()
                .documentId(documentId)
                .actionName(actuallyTransition ? action : action + " (Partial)")
                .fromStateId(currentStateId)
                .toStateId(actuallyTransition ? transition.getToStateId() : currentStateId)
                .performedBy(username)
                .comments(comments)
                .build();
        historyRepository.save(history);

        if (actuallyTransition) {
            // Update Document State
            document.setCurrentStateId(transition.getToStateId());
            document.setStateUpdatedAt(java.time.LocalDateTime.now());
            document.setAssignedUsername(null); // Reset assignment on transition

            stateRepository.findById(transition.getToStateId()).ifPresent(targetState -> {
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
                // Handle multiple fields here dynamically if needed
            }

            // Emails
            if (targetState.getSendEmail() != null && targetState.getSendEmail()) {
                notificationService.sendNotification("role_" + userRole + "@example.com", "Document requires attention", "Document " + document.getDocumentNumber() + " is now in state " + targetState.getStateName());
            }
        });

        // Email to Creator
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

        return documentRepository.findByCurrentStateIdIn(statesWaitingForRole, pageable).map(this::toDto);
    }

    public List<DocumentResponseDTO> getDocumentsByUser(String username) {
        return documentRepository.findByOwnerUsername(username).stream().map(this::toDto).toList();
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
        return documents.map(this::toDto);
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
}
