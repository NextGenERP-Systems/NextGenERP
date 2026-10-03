package com.nextgen.erp.crm.dto;

import com.nextgen.erp.crm.domain.enums.CrmOpportunityStatus;
import lombok.Data;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CrmOpportunityRequest {
    @NotBlank @Size(max = 255)
    private String opportunityName;
    private UUID prospectId;
    private UUID customerId;
    @DecimalMin("0.00") @Digits(integer = 13, fraction = 2)
    private BigDecimal amount;
    private LocalDate expectedCloseDate;
    private UUID salesStageId;
    private UUID opportunityTypeId;
    @Min(0) @Max(100)
    private Integer probability;
    private CrmOpportunityStatus status;
    private UUID lostReasonId;
    private UUID assignedTo;
    private UUID attributionTouchpointId;
    // Optional for legacy clients; the Phase 8 UI always supplies this on PUT.
    private LocalDateTime expectedUpdatedAt;
}
