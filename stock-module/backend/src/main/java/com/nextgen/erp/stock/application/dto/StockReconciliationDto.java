package com.nextgen.erp.stock.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockReconciliationDto {
    private String id;
    private String reconciliationNumber;
    private LocalDate postingDate;
    private LocalTime postingTime;
    private String purpose;
    private String status;
    private BigDecimal differenceAmount;
    private String expenseAccount;
    private String remarks;
    private ZonedDateTime createdAt;
    private List<ReconciliationItemDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReconciliationItemDto {
        private String id;
        private String itemId;
        private String itemCode;
        private String itemName;
        private String warehouseId;
        private String warehouseName;
        private BigDecimal currentQty;
        private BigDecimal currentValuationRate;
        private BigDecimal currentStockValue;
        private BigDecimal physicalQty;
        private BigDecimal valuationRate;
        private BigDecimal diffQty;
        private BigDecimal amountDifference;
        private String batchId;
        private String serialNos;
    }
}
