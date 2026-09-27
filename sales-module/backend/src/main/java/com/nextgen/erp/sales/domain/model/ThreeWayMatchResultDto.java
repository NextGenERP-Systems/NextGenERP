package com.nextgen.erp.sales.domain.model;

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
public class ThreeWayMatchResultDto {
    private UUID purchaseOrderId;
    private String poNumber;
    private String supplierName;
    private LocalDate poDate;
    private BigDecimal poGrandTotal;
    private String matchStatus; // 'PERFECT_MATCH', 'QUANTITY_MISMATCH', 'PRICE_MISMATCH', 'BLOCKED_OVERBILLED'
    private boolean isApprovedForPayment;
    private String auditSummary;
    private List<MatchLineItemDto> lineItems;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchLineItemDto {
        private String itemCode;
        private String itemName;
        private BigDecimal orderedQty;
        private BigDecimal receivedQty;
        private BigDecimal billedQty;
        private BigDecimal orderedRate;
        private BigDecimal billedRate;
        private BigDecimal qtyVariance; // Billed - Received
        private BigDecimal rateVariance; // Billed Rate - PO Rate
        private BigDecimal amountVariance; // Total difference
        private String lineStatus; // 'MATCHED', 'OVER_BILLED', 'OVER_PRICED', 'PENDING_RECEIPT'
        private boolean isToleranceExceeded;
    }
}
