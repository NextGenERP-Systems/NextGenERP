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
public class SalesOrderCreateRequest {
    private String orderNumber;
    private LocalDate transactionDate;
    
    @NotNull(message = "Delivery date is required")
    private LocalDate deliveryDate;
    
    private String poNo;
    private LocalDate poDate;
    
    @NotNull(message = "Customer ID is required")
    private UUID customerId;
    
    private UUID quotationId;
    
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
    
    @Builder.Default
    private Boolean reserveStock = false;
    
    @Builder.Default
    private Boolean skipDeliveryNote = false;
    
    private String paymentTermsTemplate;
    private String termsAndConditions;
    
    @Builder.Default
    private BigDecimal commissionRate = BigDecimal.ZERO;
    
    @NotEmpty(message = "Sales Order must contain at least one item")
    private List<OrderItemRequest> items;
    
    private List<OrderTaxRequest> taxes;
    private List<OrderSalesTeamRequest> salesTeam;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        @NotNull(message = "Item ID is required")
        private UUID itemId;
        private String description;
        private String warehouse;
        private LocalDate deliveryDate;
        private BigDecimal qty;
        private BigDecimal priceListRate;
        private BigDecimal discountPercentage;
        private BigDecimal discountAmount;
        private Boolean deliveredBySupplier;
        private Boolean grantCommission;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderTaxRequest {
        private TaxChargeType chargeType;
        private Integer rowId;
        private String accountHead;
        private String description;
        private BigDecimal rate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderSalesTeamRequest {
        private String salesPersonName;
        private BigDecimal allocatedPercentage;
        private BigDecimal commissionRate;
    }
}
