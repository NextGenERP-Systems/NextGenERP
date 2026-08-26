package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.DiscountApplyOn;
import com.nextgen.erp.sales.domain.model.OrderType;
import com.nextgen.erp.sales.domain.model.QuotationStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationDto {
    private UUID id;
    private String quotationNumber;
    private LocalDate transactionDate;
    private LocalDate validTill;
    private UUID customerId;
    private String customerName;
    private OrderType orderType;
    private QuotationStatus status;
    private String currency;
    private BigDecimal conversionRate;
    private UUID sellingPriceListId;
    
    private BigDecimal totalQty;
    private BigDecimal netTotal;
    private BigDecimal baseNetTotal;
    private BigDecimal totalTaxesAndCharges;
    private BigDecimal baseTotalTaxesAndCharges;
    private BigDecimal discountAmount;
    private BigDecimal additionalDiscountPercentage;
    private DiscountApplyOn applyDiscountOn;
    private BigDecimal grandTotal;
    private BigDecimal baseGrandTotal;
    
    private String paymentTermsTemplate;
    private String termsAndConditions;
    private String notes;
    
    private List<QuotationItemDto> items;
    private List<SalesTaxAndChargeDto> taxes;
    private OffsetDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuotationItemDto {
        private UUID id;
        private Integer idx;
        private UUID itemId;
        private String itemCode;
        private String itemName;
        private String description;
        private BigDecimal qty;
        private String uom;
        private BigDecimal conversionFactor;
        private BigDecimal stockQty;
        private BigDecimal priceListRate;
        private BigDecimal discountPercentage;
        private BigDecimal discountAmount;
        private BigDecimal rate;
        private BigDecimal amount;
        private BigDecimal netRate;
        private BigDecimal netAmount;
        private BigDecimal valuationRate;
        private BigDecimal grossProfit;
        private BigDecimal orderedQty;
    }
}
