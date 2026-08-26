package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.OpportunityStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpportunityDto {
    private UUID id;
    private String title;
    private String opportunityFrom;
    private UUID partyId;
    private String partyName;
    private String opportunityType;
    private OpportunityStatus status;
    private BigDecimal dealSize;
    private BigDecimal probability;
    private LocalDate expectedClosingDate;
    private String salesStage;
    private String contactEmail;
    private String contactPhone;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
