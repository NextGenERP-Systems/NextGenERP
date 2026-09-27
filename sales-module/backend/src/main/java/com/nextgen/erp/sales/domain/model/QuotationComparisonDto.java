package com.nextgen.erp.sales.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationComparisonDto {
    private UUID materialRequestId;
    private String materialRequestNumber;
    private List<SupplierQuoteSummaryDto> supplierQuotes;
    private List<ComparisonItemRowDto> itemRows;
    private String recommendedSupplier;
    private String recommendationReason;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierQuoteSummaryDto {
        private UUID quotationId;
        private String quotationNumber;
        private String supplierName;
        private BigDecimal grandTotal;
        private Integer leadTimeDays;
        private BigDecimal qualityRating;
        private String paymentTerms;
        private boolean isAwarded;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparisonItemRowDto {
        private String itemCode;
        private String itemName;
        private BigDecimal requiredQty;
        private List<SupplierItemQuoteDto> quotesBySupplier;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierItemQuoteDto {
        private String supplierName;
        private BigDecimal rate;
        private BigDecimal amount;
        private Integer leadTimeDays;
        private boolean isLowestPrice;
    }
}
