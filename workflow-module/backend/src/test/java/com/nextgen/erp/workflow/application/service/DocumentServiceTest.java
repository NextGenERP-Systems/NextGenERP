package com.nextgen.erp.workflow.application.service;

import com.nextgen.erp.workflow.domain.model.*;
import com.nextgen.erp.workflow.domain.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for DocumentService.
 *
 * Covers:
 *   - createDocument  (number generation)
 *   - getDocumentById (found / not found)
 *   - updateDocument  (role guard, field updates)
 *   - transitionDocument (happy path, self-approval block, SpEL condition,
 *                         permission denied, invalid transition)
 *   - getDocumentsPendingApproval
 *   - getDocumentHistory
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("DocumentService Unit Tests")
class DocumentServiceExtendedTest {

    // -------------------------------------------------------------------------
    // Mocks
    // -------------------------------------------------------------------------
    @Mock private DocumentRepository           documentRepository;
    @Mock private WorkflowTransitionRepository transitionRepository;
    @Mock private WorkflowHistoryRepository    historyRepository;
    @Mock private WorkflowStateRepository      stateRepository;
    @Mock private EmailService                 emailService;

    @InjectMocks
    private DocumentService documentService;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    private final UUID WORKFLOW_ID  = UUID.randomUUID();
    private final UUID DRAFT_ID     = UUID.randomUUID();
    private final UUID PENDING_ID   = UUID.randomUUID();
    private final UUID APPROVED_ID  = UUID.randomUUID();

    private Document buildDoc(UUID id, String owner, UUID stateId) {
        Document doc = new Document();
        doc.setId(id);
        doc.setTitle("Test Contract");
        doc.setDocumentType("CONTRACT");
        doc.setOwnerUsername(owner);
        doc.setWorkflowId(WORKFLOW_ID);
        doc.setCurrentStateId(stateId);
        doc.setStatus("Draft");
        doc.setAmount(5000.0);
        return doc;
    }

    private WorkflowTransition buildTransition(UUID from, UUID to, String action, String role,
                                               boolean selfApproval, boolean emailToCreator,
                                               String conditionExpr) {
        return WorkflowTransition.builder()
                .id(UUID.randomUUID())
                .workflowId(WORKFLOW_ID)
                .fromStateId(from)
                .toStateId(to)
                .actionName(action)
                .allowedRole(role)
                .allowSelfApproval(selfApproval)
                .sendEmailToCreator(emailToCreator)
                .conditionExpression(conditionExpr)
                .build();
    }

    private WorkflowState buildTargetState(UUID id, String name, String updateField,
                                           String updateValue, boolean sendEmail) {
        return WorkflowState.builder()
                .id(id)
                .stateName(name)
                .updateField(updateField)
                .updateValue(updateValue)
                .sendEmail(sendEmail)
                .isFinalState(false)
                .build();
    }

    // =========================================================================
    // 1. createDocument
    // =========================================================================
    @Nested
    @DisplayName("createDocument()")
    class CreateDocument {

        @Test
        @DisplayName("auto-generates DOC- prefixed document number when null")
        void generatesDocNumber_WhenNull() {
            Document doc = new Document();
            doc.setTitle("NDA Agreement");
            doc.setOwnerUsername("alice");

            when(documentRepository.save(any(Document.class))).thenAnswer(inv -> {
                Document d = inv.getArgument(0);
                d.setId(UUID.randomUUID());
                return d;
            });

            Document saved = documentService.createDocument(doc);

            assertThat(saved.getDocumentNumber()).startsWith("DOC-");
            assertThat(saved.getId()).isNotNull();
        }

        @Test
        @DisplayName("preserves existing document number if already set")
        void preservesExistingDocNumber() {
            Document doc = new Document();
            doc.setDocumentNumber("DOC-CUSTOM-001");
            doc.setTitle("Custom Contract");
            doc.setOwnerUsername("bob");

            when(documentRepository.save(any())).thenReturn(doc);

            Document saved = documentService.createDocument(doc);

            assertThat(saved.getDocumentNumber()).isEqualTo("DOC-CUSTOM-001");
        }
    }

    // =========================================================================
    // 2. getDocumentById
    // =========================================================================
    @Nested
    @DisplayName("getDocumentById()")
    class GetDocumentById {

        @Test
        @DisplayName("returns present Optional when document exists")
        void returnsPresentOptional_WhenExists() {
            UUID id  = UUID.randomUUID();
            Document doc = buildDoc(id, "alice", DRAFT_ID);
            when(documentRepository.findById(id)).thenReturn(Optional.of(doc));

            Optional<Document> result = documentService.getDocumentById(id);

            assertThat(result).isPresent();
            assertThat(result.get().getId()).isEqualTo(id);
        }

        @Test
        @DisplayName("returns empty Optional when document not found")
        void returnsEmpty_WhenNotFound() {
            UUID id = UUID.randomUUID();
            when(documentRepository.findById(id)).thenReturn(Optional.empty());

            assertThat(documentService.getDocumentById(id)).isEmpty();
        }
    }

    // =========================================================================
    // 3. updateDocument
    // =========================================================================
    @Nested
    @DisplayName("updateDocument()")
    class UpdateDocument {

        @Test
        @DisplayName("updates title and contentHtml for authorised role")
        void updatesFields_ForAuthorisedRole() {
            UUID id  = UUID.randomUUID();
            Document existing = buildDoc(id, "alice", null); // no state = no role guard
            Document updates  = new Document();
            updates.setTitle("Updated Title");
            updates.setContentHtml("<p>New content</p>");

            when(documentRepository.findById(id)).thenReturn(Optional.of(existing));
            when(documentRepository.save(existing)).thenReturn(existing);

            Document result = documentService.updateDocument(id, updates, "EMPLOYEE");

            assertThat(result.getTitle()).isEqualTo("Updated Title");
            assertThat(result.getContentHtml()).isEqualTo("<p>New content</p>");
        }

        @Test
        @DisplayName("throws RuntimeException when document does not exist")
        void throwsException_WhenDocumentNotFound() {
            UUID id = UUID.randomUUID();
            when(documentRepository.findById(id)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> documentService.updateDocument(id, new Document(), "EMPLOYEE"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Document not found");
        }

        @Test
        @DisplayName("throws RuntimeException when role is not allowed to edit in current state")
        void throwsException_WhenRoleNotAllowedToEdit() {
            UUID id = UUID.randomUUID();
            Document existing = buildDoc(id, "alice", PENDING_ID);

            WorkflowState pendingState = WorkflowState.builder()
                    .id(PENDING_ID)
                    .stateName("Pending")
                    .allowEditRole("MANAGER") // only MANAGER can edit
                    .build();

            when(documentRepository.findById(id)).thenReturn(Optional.of(existing));
            when(stateRepository.findById(PENDING_ID)).thenReturn(Optional.of(pendingState));

            assertThatThrownBy(() -> documentService.updateDocument(id, new Document(), "EMPLOYEE"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("not allowed to edit");
        }

        @Test
        @DisplayName("SYSTEM role bypasses state-based edit restriction")
        void systemRoleBypassesEditRestriction() {
            UUID id = UUID.randomUUID();
            Document existing = buildDoc(id, "alice", PENDING_ID);
            Document updates  = new Document();
            updates.setTitle("System Update");

            when(documentRepository.findById(id)).thenReturn(Optional.of(existing));
            when(documentRepository.save(existing)).thenReturn(existing);
            // stateRepository should NOT be called for SYSTEM role
            
            Document result = documentService.updateDocument(id, updates, "SYSTEM");
            assertThat(result.getTitle()).isEqualTo("System Update");
            verify(stateRepository, never()).findById(any());
        }
    }

    // =========================================================================
    // 4. transitionDocument
    // =========================================================================
    @Nested
    @DisplayName("transitionDocument()")
    class TransitionDocument {

        @Test
        @DisplayName("happy path: transitions document from Draft to Pending")
        void transitionsDocument_HappyPath() {
            UUID docId = UUID.randomUUID();
            Document doc = buildDoc(docId, "alice", DRAFT_ID);

            WorkflowTransition transition = buildTransition(
                    DRAFT_ID, PENDING_ID, "Submit", "EMPLOYEE", true, false, null);

            WorkflowState pendingState = buildTargetState(PENDING_ID, "Pending", "status", "Pending Review", false);

            when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
            when(transitionRepository.findAll()).thenReturn(List.of(transition));
            when(stateRepository.findById(PENDING_ID)).thenReturn(Optional.of(pendingState));
            when(documentRepository.save(doc)).thenReturn(doc);

            Document result = documentService.transitionDocument(docId, "Submit", "EMPLOYEE", "alice", "Submitting for review");

            assertThat(result.getCurrentStateId()).isEqualTo(PENDING_ID);
            assertThat(result.getStatus()).isEqualTo("Pending Review");
            verify(historyRepository, times(1)).save(any(WorkflowHistory.class));
        }

        @Test
        @DisplayName("throws exception when no valid transition exists for action + role")
        void throwsException_WhenNoValidTransition() {
            UUID docId = UUID.randomUUID();
            Document doc = buildDoc(docId, "alice", DRAFT_ID);

            // Only MANAGER can Approve from PENDING — EMPLOYEE trying to Approve from DRAFT
            WorkflowTransition transition = buildTransition(
                    PENDING_ID, APPROVED_ID, "Approve", "MANAGER", true, false, null);

            when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
            when(transitionRepository.findAll()).thenReturn(List.of(transition));

            assertThatThrownBy(() ->
                    documentService.transitionDocument(docId, "Approve", "EMPLOYEE", "alice", null))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Invalid transition or permission denied");
        }

        @Test
        @DisplayName("blocks self-approval when allowSelfApproval is false")
        void blocksSelfApproval_WhenNotAllowed() {
            UUID docId = UUID.randomUUID();
            Document doc = buildDoc(docId, "alice", PENDING_ID); // alice is the owner

            WorkflowTransition transition = buildTransition(
                    PENDING_ID, APPROVED_ID, "Approve", "MANAGER", false, false, null);
            // alice is trying to approve her own document
            when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
            when(transitionRepository.findAll()).thenReturn(List.of(transition));

            assertThatThrownBy(() ->
                    documentService.transitionDocument(docId, "Approve", "MANAGER", "alice", null))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Self-approval is not allowed");
        }

        @Test
        @DisplayName("allows ADMIN role to bypass role restriction and transition")
        void adminBypassesRoleRestriction() {
            UUID docId = UUID.randomUUID();
            Document doc = buildDoc(docId, "alice", PENDING_ID);

            WorkflowTransition transition = buildTransition(
                    PENDING_ID, APPROVED_ID, "Approve", "MANAGER", true, false, null);

            WorkflowState approvedState = buildTargetState(APPROVED_ID, "Approved", "status", "Approved", false);

            when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
            when(transitionRepository.findAll()).thenReturn(List.of(transition));
            when(stateRepository.findById(APPROVED_ID)).thenReturn(Optional.of(approvedState));
            when(documentRepository.save(doc)).thenReturn(doc);

            // ADMIN user "superuser" approving (not the same as owner "alice")
            Document result = documentService.transitionDocument(docId, "Approve", "ADMIN", "superuser", null);

            assertThat(result.getCurrentStateId()).isEqualTo(APPROVED_ID);
        }

        @Test
        @DisplayName("blocks transition when SpEL condition is not met (amount too low)")
        void blocksTransition_WhenSpELConditionFails() {
            UUID docId = UUID.randomUUID();
            Document doc = buildDoc(docId, "alice", DRAFT_ID);
            doc.setAmount(100.0); // below threshold

            // Condition: amount must be >= 1000 to submit
            WorkflowTransition transition = buildTransition(
                    DRAFT_ID, PENDING_ID, "Submit", "EMPLOYEE", true, false,
                    "#doc.amount >= 1000");

            when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
            when(transitionRepository.findAll()).thenReturn(List.of(transition));

            assertThatThrownBy(() ->
                    documentService.transitionDocument(docId, "Submit", "EMPLOYEE", "alice", null))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Transition condition not met");
        }

        @Test
        @DisplayName("sends email to creator when sendEmailToCreator flag is true")
        void sendsEmailToCreator_WhenFlagEnabled() {
            UUID docId = UUID.randomUUID();
            Document doc = buildDoc(docId, "alice", DRAFT_ID);
            doc.setDocumentNumber("DOC-001");

            WorkflowTransition transition = buildTransition(
                    DRAFT_ID, PENDING_ID, "Submit", "EMPLOYEE", true, true, null); // sendEmailToCreator = true

            WorkflowState pendingState = buildTargetState(PENDING_ID, "Pending", "status", "Pending", false);

            when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
            when(transitionRepository.findAll()).thenReturn(List.of(transition));
            when(stateRepository.findById(PENDING_ID)).thenReturn(Optional.of(pendingState));
            when(documentRepository.save(doc)).thenReturn(doc);

            documentService.transitionDocument(docId, "Submit", "EMPLOYEE", "bob", "Submitting");

            verify(emailService, times(1)).sendEmail(
                    eq("alice@example.com"), anyString(), anyString());
        }

        @Test
        @DisplayName("throws RuntimeException when document not found during transition")
        void throwsException_WhenDocumentNotFound() {
            UUID docId = UUID.randomUUID();
            when(documentRepository.findById(docId)).thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                    documentService.transitionDocument(docId, "Submit", "EMPLOYEE", "alice", null))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Document not found");
        }

        @Test
        @DisplayName("records a WorkflowHistory entry on every successful transition")
        void recordsHistoryEntry_OnSuccessfulTransition() {
            UUID docId = UUID.randomUUID();
            Document doc = buildDoc(docId, "alice", DRAFT_ID);

            WorkflowTransition transition = buildTransition(
                    DRAFT_ID, PENDING_ID, "Submit", "EMPLOYEE", true, false, null);

            WorkflowState pendingState = buildTargetState(PENDING_ID, "Pending", null, null, false);

            when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
            when(transitionRepository.findAll()).thenReturn(List.of(transition));
            when(stateRepository.findById(PENDING_ID)).thenReturn(Optional.of(pendingState));
            when(documentRepository.save(doc)).thenReturn(doc);

            documentService.transitionDocument(docId, "Submit", "EMPLOYEE", "bob", "Looks good");

            ArgumentCaptor<WorkflowHistory> historyCaptor = ArgumentCaptor.forClass(WorkflowHistory.class);
            verify(historyRepository).save(historyCaptor.capture());

            WorkflowHistory recorded = historyCaptor.getValue();
            assertThat(recorded.getDocumentId()).isEqualTo(docId);
            assertThat(recorded.getActionName()).isEqualTo("Submit");
            assertThat(recorded.getFromStateId()).isEqualTo(DRAFT_ID);
            assertThat(recorded.getToStateId()).isEqualTo(PENDING_ID);
            assertThat(recorded.getPerformedBy()).isEqualTo("bob");
            assertThat(recorded.getComments()).isEqualTo("Looks good");
        }
    }

    // =========================================================================
    // 5. getDocumentsPendingApproval
    // =========================================================================
    @Nested
    @DisplayName("getDocumentsPendingApproval()")
    class GetDocumentsPendingApproval {

        @Test
        @DisplayName("returns documents whose currentStateId is in the MANAGER-reachable from-states")
        void returnsPendingDocs_ForRole() {
            // MANAGER can Approve from PENDING_ID
            WorkflowTransition t1 = buildTransition(PENDING_ID, APPROVED_ID, "Approve", "MANAGER", true, false, null);
            WorkflowTransition t2 = buildTransition(DRAFT_ID, PENDING_ID, "Submit", "EMPLOYEE", true, false, null);

            Document pendingDoc = buildDoc(UUID.randomUUID(), "alice", PENDING_ID);
            Page<Document> page = new PageImpl<>(List.of(pendingDoc));

            when(transitionRepository.findAll()).thenReturn(List.of(t1, t2));
            when(documentRepository.findByCurrentStateIdIn(
                    List.of(PENDING_ID), Pageable.unpaged())).thenReturn(page);

            Page<Document> result = documentService.getDocumentsPendingApproval("MANAGER", Pageable.unpaged());

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getCurrentStateId()).isEqualTo(PENDING_ID);
        }
    }

    // =========================================================================
    // 6. getDocumentHistory
    // =========================================================================
    @Nested
    @DisplayName("getDocumentHistory()")
    class GetDocumentHistory {

        @Test
        @DisplayName("returns history entries ordered by creation time descending")
        void returnsHistory_OrderedByCreatedAtDesc() {
            UUID docId = UUID.randomUUID();
            WorkflowHistory h1 = WorkflowHistory.builder()
                    .id(UUID.randomUUID()).documentId(docId).actionName("Submit").build();
            WorkflowHistory h2 = WorkflowHistory.builder()
                    .id(UUID.randomUUID()).documentId(docId).actionName("Approve").build();

            when(historyRepository.findByDocumentIdOrderByCreatedAtDesc(docId))
                    .thenReturn(List.of(h2, h1)); // Approve comes first (most recent)

            List<WorkflowHistory> result = documentService.getDocumentHistory(docId);

            assertThat(result).hasSize(2);
            assertThat(result.get(0).getActionName()).isEqualTo("Approve");
            assertThat(result.get(1).getActionName()).isEqualTo("Submit");
        }

        @Test
        @DisplayName("returns empty list when document has no history")
        void returnsEmpty_WhenNoHistory() {
            UUID docId = UUID.randomUUID();
            when(historyRepository.findByDocumentIdOrderByCreatedAtDesc(docId))
                    .thenReturn(Collections.emptyList());

            assertThat(documentService.getDocumentHistory(docId)).isEmpty();
        }
    }
}
