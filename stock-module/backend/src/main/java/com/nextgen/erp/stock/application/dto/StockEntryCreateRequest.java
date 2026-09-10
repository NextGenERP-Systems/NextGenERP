package com.nextgen.erp.stock.application.dto;

import com.nextgen.erp.stock.domain.model.StockEntryPurpose;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockEntryCreateRequest {
    @NotNull(message = "Stock entry purpose is required")
    private StockEntryPurpose purpose;

    private LocalDate postingDate;
    private LocalTime postingTime;
    private String fromWarehouseId;
    private String toWarehouseId;
    private BigDecimal additionalCosts;
    private String workOrderId;
    private String bomId;
    private String remarks;

    @NotEmpty(message = "Stock entry must contain at least one item")
    private List<StockEntryItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockEntryItemRequest {
        @NotNull(message = "Item ID is required")
        private String itemId;
        private String sourceWarehouseId;
        private String targetWarehouseId;
        @NotNull(message = "Quantity is required")
        private BigDecimal qty;
        private String uomId;
        private BigDecimal basicRate;
        private BigDecimal additionalCost;
        private String batchId;
        private String serialNos;
        private Boolean isScrapItem;
    }
}
