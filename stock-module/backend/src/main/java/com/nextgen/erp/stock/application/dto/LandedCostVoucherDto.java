package com.nextgen.erp.stock.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LandedCostVoucherDto {
    private String id;
    private String voucherNumber;
    private LocalDate postingDate;
    private String distributeChargesBasedOn; // 'Amount', 'Qty', 'Distribute Manually'
    private BigDecimal totalTaxesAndCharges;
    private String status;
    private String remarks;
    private ZonedDateTime createdAt;
    private List<LandedCostItemDto> items;
    private List<LandedCostTaxDto> taxes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LandedCostItemDto {
        private String id;
        private String receiptDocumentType;
        private String receiptDocumentId;
        private String itemId;
        private String itemCode;
        private String itemName;
        private BigDecimal qty;
        private BigDecimal rate;
        private BigDecimal amount;
        private BigDecimal applicableCharges;
        private BigDecimal newRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LandedCostTaxDto {
        private String id;
        private String expenseAccount;
        private String description;
        private BigDecimal amount;
    }
}
