package com.nextgen.erp.crm.dto;

import com.nextgen.erp.crm.domain.enums.CrmOpportunityStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CrmOpportunityRequest {
    private String opportunityName;
    private UUID prospectId;
    private UUID customerId;
    private BigDecimal amount;
    private LocalDate expectedCloseDate;
    private UUID salesStageId;
    private UUID opportunityTypeId;
    private Integer probability;
    private CrmOpportunityStatus status;
    private UUID lostReasonId;
    private UUID assignedTo;
}
