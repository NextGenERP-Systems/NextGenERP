package com.nextgen.erp.stock.application.dto;

import com.nextgen.erp.stock.domain.model.StockEntryPurpose;
import com.nextgen.erp.stock.domain.model.StockEntryStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockEntryDto {
    private String id;
    private String entryNumber;
    private StockEntryPurpose purpose;
    private LocalDate postingDate;
    private LocalTime postingTime;
    private String fromWarehouseId;
    private String fromWarehouseName;
    private String toWarehouseId;
    private String toWarehouseName;
    private BigDecimal totalIncomingValue;
    private BigDecimal totalOutgoingValue;
    private BigDecimal valueDifference;
    private BigDecimal additionalCosts;
    private String workOrderId;
    private String bomId;
    private StockEntryStatus status;
    private String remarks;
    private String createdBy;
    private ZonedDateTime createdAt;
    private List<StockEntryItemResponse> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockEntryItemResponse {
        private String id;
        private String itemId;
        private String itemCode;
        private String itemName;
        private String sourceWarehouseId;
        private String sourceWarehouseName;
        private String targetWarehouseId;
        private String targetWarehouseName;
        private BigDecimal qty;
        private String uomId;
        private BigDecimal basicRate;
        private BigDecimal amount;
        private BigDecimal additionalCost;
        private BigDecimal valuationRate;
        private String batchId;
        private String serialNos;
        private Boolean isScrapItem;
    }
}
