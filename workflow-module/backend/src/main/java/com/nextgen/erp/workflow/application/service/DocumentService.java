package com.nextgen.erp.workflow.application.service;

import com.nextgen.erp.workflow.domain.model.Document;
import com.nextgen.erp.workflow.domain.model.WorkflowHistory;
import com.nextgen.erp.workflow.domain.model.WorkflowState;
import com.nextgen.erp.workflow.domain.model.WorkflowTransition;
import com.nextgen.erp.workflow.domain.repository.DocumentRepository;
import com.nextgen.erp.workflow.domain.repository.WorkflowHistoryRepository;
import com.nextgen.erp.workflow.domain.repository.WorkflowStateRepository;
import com.nextgen.erp.workflow.domain.repository.WorkflowTransitionRepository;
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

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final WorkflowTransitionRepository transitionRepository;
    private final WorkflowHistoryRepository historyRepository;
    private final WorkflowStateRepository stateRepository;
    private final EmailService emailService;

    public Page<Document> getAllDocuments(String searchQuery, Pageable pageable) {
        if (searchQuery != null && !searchQuery.isBlank()) {
            return documentRepository.searchDocuments(searchQuery, pageable);
        }
        return documentRepository.findAll(pageable);
    }

    public Optional<Document> getDocumentById(UUID id) {
        return documentRepository.findById(id);
    }

    @Transactional
    public Document createDocument(Document document) {
        if (document.getDocumentNumber() == null) {
            document.setDocumentNumber("DOC-" + System.currentTimeMillis());
        }
        return documentRepository.save(document);
    }

    @Transactional
    public Document updateDocument(UUID id, Document updatedDocument, String userRole) {
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

                    doc.setTitle(updatedDocument.getTitle());
                    doc.setContentHtml(updatedDocument.getContentHtml());
                    if (updatedDocument.getAmount() != null) {
                        doc.setAmount(updatedDocument.getAmount());
                    }
                    if (updatedDocument.getGcsAttachmentUrl() != null) {
                        doc.setGcsAttachmentUrl(updatedDocument.getGcsAttachmentUrl());
                    }
                    return documentRepository.save(doc);
                })
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }

    @Transactional
    public Document transitionDocument(UUID documentId, String action, String userRole, String username, String comments) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        UUID currentStateId = document.getCurrentStateId();

        List<WorkflowTransition> validTransitions = transitionRepository.findAll().stream()
                .filter(t -> t.getWorkflowId().equals(document.getWorkflowId()) 
                        && (currentStateId == null || currentStateId.equals(t.getFromStateId()))
                        && t.getActionName().equalsIgnoreCase(action)
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
        if (transition.getConditionExpression() != null && !transition.getConditionExpression().isEmpty()) {
            ExpressionParser parser = new SpelExpressionParser();
            StandardEvaluationContext context = new StandardEvaluationContext();
            context.setVariable("doc", document);
            Boolean result = parser.parseExpression(transition.getConditionExpression()).getValue(context, Boolean.class);
            if (result == null || !result) {
                throw new RuntimeException("Transition condition not met.");
            }
        }
        
        // Record History
        WorkflowHistory history = WorkflowHistory.builder()
                .documentId(documentId)
                .actionName(action)
                .fromStateId(currentStateId)
                .toStateId(transition.getToStateId())
                .performedBy(username)
                .comments(comments)
                .build();
        historyRepository.save(history);

        // Update Document State
        document.setCurrentStateId(transition.getToStateId());

        // Process Target State logic (Status Update and Email)
        stateRepository.findById(transition.getToStateId()).ifPresent(targetState -> {
            // Field updates
            if ("status".equalsIgnoreCase(targetState.getUpdateField()) && targetState.getUpdateValue() != null) {
                document.setStatus(targetState.getUpdateValue());
            }

            // Emails
            if (targetState.getSendEmail() != null && targetState.getSendEmail()) {
                emailService.sendEmail("role_" + userRole + "@example.com", "Document requires attention", "Document " + document.getDocumentNumber() + " is now in state " + targetState.getStateName());
            }
        });

        // Email to Creator
        if (transition.getSendEmailToCreator() != null && transition.getSendEmailToCreator()) {
             emailService.sendEmail(document.getOwnerUsername() + "@example.com", "Document Update", "Your document " + document.getDocumentNumber() + " was transitioned via action " + action);
        }

        return documentRepository.save(document);
    }

    public Page<Document> getDocumentsPendingApproval(String role, Pageable pageable) {
        List<UUID> statesWaitingForRole = transitionRepository.findAll().stream()
                .filter(t -> t.getAllowedRole().equalsIgnoreCase(role))
                .map(WorkflowTransition::getFromStateId)
                .distinct()
                .toList();

        return documentRepository.findByCurrentStateIdIn(statesWaitingForRole, pageable);
    }

    public List<WorkflowHistory> getDocumentHistory(UUID documentId) {
        return historyRepository.findByDocumentIdOrderByCreatedAtDesc(documentId);
    }
}
