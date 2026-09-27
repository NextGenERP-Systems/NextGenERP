package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.WarrantyClaim;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarrantyClaimDto {
    private UUID id;
    private String claimNumber;
    private UUID customerId;
    private String customerName;
    private String itemCode;
    private String itemName;
    private String serialNo;
    private String complaintDescription;
    private WarrantyClaim.ClaimStatus status;
    private String resolutionType;
    private String resolutionNotes;
    private LocalDate reportedDate;
    private LocalDate resolvedDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
