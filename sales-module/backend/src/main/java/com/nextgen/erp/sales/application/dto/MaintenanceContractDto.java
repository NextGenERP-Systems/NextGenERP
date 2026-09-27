package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.MaintenanceContract;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceContractDto {
    private UUID id;
    private String contractNumber;
    private UUID customerId;
    private String customerName;
    private String contractType;
    private MaintenanceContract.ContractStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalAmount;
    private BigDecimal invoicedAmount;
    private String termsAndConditions;
    @Builder.Default
    private List<ContractItemDto> items = new ArrayList<>();
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractItemDto {
        private UUID id;
        private UUID itemId;
        private String itemCode;
        private String itemName;
        private String serialNo;
        private LocalDate startDate;
        private LocalDate endDate;
        private String periodicity;
        private Integer noOfVisits;
        private BigDecimal rate;
        private BigDecimal amount;
    }
}
