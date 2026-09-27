package com.nextgen.erp.sales.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarrantyClaimCreateRequest {

    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    @NotBlank(message = "Item Code is required")
    private String itemCode;

    @NotBlank(message = "Item Name is required")
    private String itemName;

    private String serialNo;

    @NotBlank(message = "Complaint description is required")
    private String complaintDescription;

    private String resolutionType;
}
