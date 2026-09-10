package com.nextgen.erp.stock.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockSummaryMetricsDto {
    private BigDecimal totalInventoryValue;
    private long totalItemsCount;
    private long totalWarehousesCount;
    private long lowStockAlertsCount;
    private long totalBatchesCount;
    private long totalActiveSerialsCount;
    private long pendingInspectionsCount;
    private List<WarehouseStockSummary> warehouseSummaries;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseStockSummary {
        private String warehouseId;
        private String warehouseName;
        private BigDecimal totalValue;
        private long itemCount;
        private BigDecimal totalItemsQuantity;
    }
}
