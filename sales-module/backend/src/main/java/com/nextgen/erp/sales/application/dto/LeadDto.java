package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.LeadStatus;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadDto {
    private UUID id;
    private String leadName;
    private String companyName;
    private String email;
    private String phone;
    private LeadStatus status;
    private String leadSource;
    private UUID territoryId;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
