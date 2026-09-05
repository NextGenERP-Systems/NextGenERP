package com.nextgen.erp.workflow.api.dto;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class DocumentResponseDTO {
    private UUID id;
    private String documentNumber;
    private String title;
    private String documentType;
    
    // Metadata relationships
    private UUID templateId;
    private String templateName;
    private UUID workflowId;
    private String workflowName;
    private UUID currentStateId;
    private String currentStateName;
    private String currentStateColor;
    
    // Data
    private String status;
    private Double amount;
    private String contentHtml;
    private String gcsAttachmentUrl;
    private String ownerUsername;
    private String assignedUsername;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Integer version;
}
