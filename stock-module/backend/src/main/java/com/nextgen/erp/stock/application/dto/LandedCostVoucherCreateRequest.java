package com.nextgen.erp.stock.application.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LandedCostVoucherCreateRequest {
    private LocalDate postingDate;
    
    @Builder.Default
    private String distributeChargesBasedOn = "Amount"; // 'Amount', 'Qty', 'Distribute Manually'
    
    private String remarks;

    @NotEmpty
    private List<ItemRequest> items;

    @NotEmpty
    private List<TaxRequest> taxes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemRequest {
        @NotNull
        private String receiptDocumentType; // 'Purchase Receipt', 'Stock Entry'
        @NotNull
        private String receiptDocumentId;
        @NotNull
        private String itemId;
        @NotNull
        private BigDecimal qty;
        @NotNull
        private BigDecimal rate;
        private BigDecimal amount;
        private BigDecimal applicableCharges;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaxRequest {
        @NotNull
        private String expenseAccount;
        private String description;
        @NotNull
        private BigDecimal amount;
    }
}
