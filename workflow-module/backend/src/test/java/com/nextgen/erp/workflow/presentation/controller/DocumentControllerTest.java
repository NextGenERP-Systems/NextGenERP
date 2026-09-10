package com.nextgen.erp.workflow.presentation.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextgen.erp.workflow.application.service.DocumentService;
import com.nextgen.erp.workflow.domain.model.Document;
import com.nextgen.erp.workflow.domain.model.WorkflowHistory;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Spring MVC slice (integration) tests for DocumentController.
 *
 * Uses H2 in-memory DB via application-test.properties.
 * All service calls are mocked; only HTTP layer is tested.
 *
 * Covers:
 *   GET  /api/v1/documents           - list with optional search
 *   GET  /api/v1/documents/{id}      - find by id
 *   GET  /api/v1/documents/{id}/history
 *   GET  /api/v1/documents/approvals
 *   POST /api/v1/documents           - create
 *   PUT  /api/v1/documents/{id}      - update
 *   POST /api/v1/documents/{id}/transition
 */
@WebMvcTest(DocumentController.class)
@DisplayName("DocumentController Integration Tests")
class DocumentControllerTest {

    @Autowired private MockMvc       mockMvc;
    @Autowired private ObjectMapper  objectMapper;

    @MockBean private DocumentService documentService;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    private Document buildDoc(UUID id, String title, String status) {
        Document doc = new Document();
        doc.setId(id);
        doc.setTitle(title);
        doc.setDocumentNumber("DOC-" + System.currentTimeMillis());
        doc.setDocumentType("CONTRACT");
        doc.setOwnerUsername("alice");
        doc.setStatus(status);
        doc.setWorkflowId(UUID.randomUUID());
        return doc;
    }

    // =========================================================================
    // GET /api/v1/documents
    // =========================================================================
    @Nested
    @DisplayName("GET /api/v1/documents")
    class GetAllDocuments {

        @Test
        @WithMockUser
        @DisplayName("returns 200 with page of documents")
        void returns200_WithDocumentPage() throws Exception {
            UUID id1 = UUID.randomUUID();
            UUID id2 = UUID.randomUUID();
            Page<Document> page = new PageImpl<>(List.of(
                    buildDoc(id1, "NDA Agreement",    "Draft"),
                    buildDoc(id2, "Sales Contract",   "Pending Review")
            ));

            when(documentService.getAllDocuments(isNull(), any(Pageable.class))).thenReturn(page);

            mockMvc.perform(get("/api/v1/documents").contentType(MediaType.APPLICATION_JSON))
                   .andExpect(status().isOk())
                   .andExpect(jsonPath("$.content", hasSize(2)))
                   .andExpect(jsonPath("$.content[0].title", is("NDA Agreement")))
                   .andExpect(jsonPath("$.content[1].title", is("Sales Contract")));
        }

        @Test
        @WithMockUser
        @DisplayName("passes search query to service and returns filtered results")
        void passesSearchQueryToService() throws Exception {
            UUID id = UUID.randomUUID();
            Page<Document> page = new PageImpl<>(List.of(buildDoc(id, "NDA Agreement", "Draft")));
            when(documentService.getAllDocuments(eq("NDA"), any(Pageable.class))).thenReturn(page);

            mockMvc.perform(get("/api/v1/documents").param("search", "NDA"))
                   .andExpect(status().isOk())
                   .andExpect(jsonPath("$.content", hasSize(1)))
                   .andExpect(jsonPath("$.content[0].title", is("NDA Agreement")));

            verify(documentService).getAllDocuments(eq("NDA"), any());
        }
    }

    // =========================================================================
    // GET /api/v1/documents/{id}
    // =========================================================================
    @Nested
    @DisplayName("GET /api/v1/documents/{id}")
    class GetDocumentById {

        @Test
        @WithMockUser
        @DisplayName("returns 200 and document body when found")
        void returns200_WhenFound() throws Exception {
            UUID id = UUID.randomUUID();
            Document doc = buildDoc(id, "Employment Contract", "Approved");
            when(documentService.getDocumentById(id)).thenReturn(Optional.of(doc));

            mockMvc.perform(get("/api/v1/documents/{id}", id))
                   .andExpect(status().isOk())
                   .andExpect(jsonPath("$.id", is(id.toString())))
                   .andExpect(jsonPath("$.title", is("Employment Contract")))
                   .andExpect(jsonPath("$.status", is("Approved")));
        }

        @Test
        @WithMockUser
        @DisplayName("returns 404 when document does not exist")
        void returns404_WhenNotFound() throws Exception {
            UUID id = UUID.randomUUID();
            when(documentService.getDocumentById(id)).thenReturn(Optional.empty());

            mockMvc.perform(get("/api/v1/documents/{id}", id))
                   .andExpect(status().isNotFound());
        }
    }

    // =========================================================================
    // GET /api/v1/documents/{id}/history
    // =========================================================================
    @Nested
    @DisplayName("GET /api/v1/documents/{id}/history")
    class GetDocumentHistory {

        @Test
        @WithMockUser
        @DisplayName("returns 200 with list of history entries")
        void returns200_WithHistoryList() throws Exception {
            UUID docId = UUID.randomUUID();
            WorkflowHistory h = WorkflowHistory.builder()
                    .id(UUID.randomUUID())
                    .documentId(docId)
                    .actionName("Submit")
                    .performedBy("alice")
                    .comments("Submitting for approval")
                    .build();

            when(documentService.getDocumentHistory(docId)).thenReturn(List.of(h));

            mockMvc.perform(get("/api/v1/documents/{id}/history", docId))
                   .andExpect(status().isOk())
                   .andExpect(jsonPath("$", hasSize(1)))
                   .andExpect(jsonPath("$[0].actionName", is("Submit")))
                   .andExpect(jsonPath("$[0].performedBy", is("alice")));
        }
    }

    // =========================================================================
    // GET /api/v1/documents/approvals
    // =========================================================================
    @Nested
    @DisplayName("GET /api/v1/documents/approvals")
    class GetApprovals {

        @Test
        @WithMockUser
        @DisplayName("returns 200 with documents pending approval for given role")
        void returns200_WithPendingApprovals() throws Exception {
            UUID id  = UUID.randomUUID();
            Page<Document> page = new PageImpl<>(List.of(buildDoc(id, "Pending Contract", "Pending Review")));
            when(documentService.getDocumentsPendingApproval(eq("MANAGER"), any())).thenReturn(page);

            mockMvc.perform(get("/api/v1/documents/approvals").param("role", "MANAGER"))
                   .andExpect(status().isOk())
                   .andExpect(jsonPath("$.content", hasSize(1)))
                   .andExpect(jsonPath("$.content[0].status", is("Pending Review")));
        }
    }

    // =========================================================================
    // POST /api/v1/documents
    // =========================================================================
    @Nested
    @DisplayName("POST /api/v1/documents")
    class CreateDocument {

        @Test
        @WithMockUser
        @DisplayName("returns 201 and created document")
        void returns201_WithCreatedDocument() throws Exception {
            UUID id  = UUID.randomUUID();
            Document requestDoc = buildDoc(null, "New NDA", null);
            Document savedDoc   = buildDoc(id,   "New NDA", "Draft");
            savedDoc.setDocumentNumber("DOC-123456789");

            when(documentService.createDocument(any(Document.class))).thenReturn(savedDoc);

            mockMvc.perform(post("/api/v1/documents")
                           .with(csrf())
                           .contentType(MediaType.APPLICATION_JSON)
                           .content(objectMapper.writeValueAsString(requestDoc)))
                   .andExpect(status().isCreated())
                   .andExpect(jsonPath("$.id", is(id.toString())))
                   .andExpect(jsonPath("$.documentNumber", startsWith("DOC-")));
        }
    }

    // =========================================================================
    // PUT /api/v1/documents/{id}
    // =========================================================================
    @Nested
    @DisplayName("PUT /api/v1/documents/{id}")
    class UpdateDocument {

        @Test
        @WithMockUser
        @DisplayName("returns 200 with updated document on success")
        void returns200_OnSuccessfulUpdate() throws Exception {
            UUID id = UUID.randomUUID();
            Document updated = buildDoc(id, "Updated NDA", "Draft");
            when(documentService.updateDocument(eq(id), any(), isNull())).thenReturn(updated);

            mockMvc.perform(put("/api/v1/documents/{id}", id)
                           .with(csrf())
                           .contentType(MediaType.APPLICATION_JSON)
                           .content(objectMapper.writeValueAsString(updated)))
                   .andExpect(status().isOk())
                   .andExpect(jsonPath("$.title", is("Updated NDA")));
        }

        @Test
        @WithMockUser
        @DisplayName("returns 404 when document not found during update")
        void returns404_WhenDocumentNotFound() throws Exception {
            UUID id = UUID.randomUUID();
            when(documentService.updateDocument(eq(id), any(), isNull()))
                    .thenThrow(new RuntimeException("Document not found"));

            mockMvc.perform(put("/api/v1/documents/{id}", id)
                           .with(csrf())
                           .contentType(MediaType.APPLICATION_JSON)
                           .content(objectMapper.writeValueAsString(new Document())))
                   .andExpect(status().isNotFound());
        }
    }

    // =========================================================================
    // POST /api/v1/documents/{id}/transition
    // =========================================================================
    @Nested
    @DisplayName("POST /api/v1/documents/{id}/transition")
    class TransitionDocument {

        @Test
        @WithMockUser
        @DisplayName("returns 200 with updated document on valid transition")
        void returns200_OnValidTransition() throws Exception {
            UUID id = UUID.randomUUID();
            Document transitioned = buildDoc(id, "NDA Agreement", "Pending Review");

            when(documentService.transitionDocument(eq(id), eq("Submit"), eq("EMPLOYEE"), eq("alice"), any()))
                    .thenReturn(transitioned);

            Map<String, String> payload = Map.of("comments", "Submitting for review");

            mockMvc.perform(post("/api/v1/documents/{id}/transition", id)
                           .with(csrf())
                           .param("action",   "Submit")
                           .param("role",     "EMPLOYEE")
                           .param("username", "alice")
                           .contentType(MediaType.APPLICATION_JSON)
                           .content(objectMapper.writeValueAsString(payload)))
                   .andExpect(status().isOk())
                   .andExpect(jsonPath("$.status", is("Pending Review")));
        }

        @Test
        @WithMockUser
        @DisplayName("returns 400 with error message on invalid transition")
        void returns400_OnInvalidTransition() throws Exception {
            UUID id = UUID.randomUUID();
            when(documentService.transitionDocument(eq(id), eq("Approve"), eq("EMPLOYEE"), eq("alice"), any()))
                    .thenThrow(new RuntimeException("Invalid transition or permission denied for action: Approve"));

            mockMvc.perform(post("/api/v1/documents/{id}/transition", id)
                           .with(csrf())
                           .param("action",   "Approve")
                           .param("role",     "EMPLOYEE")
                           .param("username", "alice")
                           .contentType(MediaType.APPLICATION_JSON)
                           .content("{}"))
                   .andExpect(status().isBadRequest())
                   .andExpect(jsonPath("$.error", containsString("Invalid transition")));
        }

        @Test
        @WithMockUser
        @DisplayName("returns 400 when self-approval is blocked")
        void returns400_WhenSelfApprovalBlocked() throws Exception {
            UUID id = UUID.randomUUID();
            when(documentService.transitionDocument(eq(id), eq("Approve"), eq("MANAGER"), eq("alice"), any()))
                    .thenThrow(new RuntimeException("Self-approval is not allowed for this transition."));

            mockMvc.perform(post("/api/v1/documents/{id}/transition", id)
                           .with(csrf())
                           .param("action",   "Approve")
                           .param("role",     "MANAGER")
                           .param("username", "alice")
                           .contentType(MediaType.APPLICATION_JSON)
                           .content("{}"))
                   .andExpect(status().isBadRequest())
                   .andExpect(jsonPath("$.error", containsString("Self-approval")));
        }
    }
}
