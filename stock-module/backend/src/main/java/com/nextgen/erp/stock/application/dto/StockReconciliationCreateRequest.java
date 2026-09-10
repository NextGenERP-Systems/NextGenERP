package com.nextgen.erp.stock.application.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockReconciliationCreateRequest {
    private LocalDate postingDate;
    private LocalTime postingTime;
    private String purpose;
    private String expenseAccount;
    private String remarks;

    @NotEmpty(message = "Reconciliation must contain items")
    private List<ReconciliationItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReconciliationItemRequest {
        private String itemId;
        private String warehouseId;
        private BigDecimal qty; // physical count
        private BigDecimal valuationRate;
    }
}
