package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.DiscountApplyOn;
import com.nextgen.erp.sales.domain.model.OrderType;
import com.nextgen.erp.sales.domain.model.TaxChargeType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationCreateRequest {
    private String quotationNumber;
    private LocalDate transactionDate;
    private LocalDate validTill;
    
    @NotNull(message = "Customer ID is required")
    private UUID customerId;
    
    @Builder.Default
    private OrderType orderType = OrderType.SALES;
    
    @Builder.Default
    private String currency = "INR";
    
    @Builder.Default
    private BigDecimal conversionRate = BigDecimal.ONE;
    
    private UUID sellingPriceListId;
    
    @Builder.Default
    private BigDecimal additionalDiscountPercentage = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    @Builder.Default
    private DiscountApplyOn applyDiscountOn = DiscountApplyOn.GRAND_TOTAL;
    
    private String paymentTermsTemplate;
    private String termsAndConditions;
    private String notes;
    
    @NotEmpty(message = "Quotation must contain at least one item")
    private List<ItemRequest> items;
    
    private List<TaxRequest> taxes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemRequest {
        @NotNull(message = "Item ID is required")
        private UUID itemId;
        private String description;
        private BigDecimal qty;
        private BigDecimal priceListRate;
        private BigDecimal discountPercentage;
        private BigDecimal discountAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaxRequest {
        private TaxChargeType chargeType;
        private Integer rowId;
        private String accountHead;
        private String description;
        private BigDecimal rate;
    }
}
