package com.nextgen.erp.sales.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceContractCreateRequest {

    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    private String contractType;

    @NotNull(message = "Start Date is required")
    private LocalDate startDate;

    @NotNull(message = "End Date is required")
    private LocalDate endDate;

    private String termsAndConditions;

    @NotEmpty(message = "At least one item is required for the contract")
    private List<ContractItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractItemRequest {
        private UUID itemId;
        @NotBlank(message = "Item Code is required")
        private String itemCode;
        @NotBlank(message = "Item Name is required")
        private String itemName;
        private String serialNo;
        private LocalDate startDate;
        private LocalDate endDate;
        private String periodicity;
        private Integer noOfVisits;
        @NotNull(message = "Rate is required")
        private BigDecimal rate;
    }
}
