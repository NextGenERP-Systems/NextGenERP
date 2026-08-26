package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.OpportunityStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpportunityCreateRequest {
    @NotBlank(message = "Title is required")
    private String title;
    private String opportunityFrom; // LEAD or CUSTOMER
    private UUID partyId;
    @NotBlank(message = "Party name is required")
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
}
