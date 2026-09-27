package com.nextgen.erp.workflow.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "documents", indexes = {
    @Index(name = "idx_doc_workflow_id", columnList = "workflow_id"),
    @Index(name = "idx_doc_current_state_id", columnList = "current_state_id"),
    @Index(name = "idx_doc_document_type", columnList = "document_type"),
    @Index(name = "idx_doc_owner_username", columnList = "owner_username")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Document {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
        name = "UUID",
        strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "document_number", nullable = false, unique = true)
    private String documentNumber;

    @Column(nullable = false)
    private String title;

    @Column(name = "document_type", nullable = false)
    private String documentType;

    @Column(name = "template_id")
    private UUID templateId;

    @Column(name = "workflow_id")
    private UUID workflowId;

    @Column(name = "current_state_id")
    private UUID currentStateId;

    @Column(name = "status")
    private String status;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "content_html", columnDefinition = "TEXT")
    private String contentHtml;

    @Column(name = "gcs_attachment_url", length = 500)
    private String gcsAttachmentUrl;

    @Column(name = "owner_username", nullable = false)
    private String ownerUsername;

    @Column(name = "assigned_username")
    private String assignedUsername;

    @Column(name = "pending_approvers")
    private String pendingApprovers;

    @Column(name = "state_updated_at")
    private java.time.LocalDateTime stateUpdatedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "version")
    private Integer version;

    @Column(name = "clarification_requested_by")
    private String clarificationRequestedBy;

    @Column(name = "clarification_return_state_id")
    private UUID clarificationReturnStateId;

    @Column(name = "furthest_state_id")
    private UUID furthestStateId;

    @Column(name = "parent_document_id")
    private UUID parentDocumentId;

    @Column(name = "child_workflow_id")
    private UUID childWorkflowId;
}
