package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.BillingStatus;
import com.nextgen.erp.sales.domain.model.DeliveryStatus;
import com.nextgen.erp.sales.domain.model.DiscountApplyOn;
import com.nextgen.erp.sales.domain.model.OrderType;
import com.nextgen.erp.sales.domain.model.SalesOrderStatus;
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
public class SalesOrderDto {
    private UUID id;
    private String orderNumber;
    private LocalDate transactionDate;
    private LocalDate deliveryDate;
    private String poNo;
    private LocalDate poDate;
    private UUID customerId;
    private String customerName;
    private OrderType orderType;
    private SalesOrderStatus status;
    private DeliveryStatus deliveryStatus;
    private BillingStatus billingStatus;
    private UUID quotationId;
    private String currency;
    private BigDecimal conversionRate;
    private UUID sellingPriceListId;
    
    private BigDecimal totalQty;
    private BigDecimal totalNetWeight;
    private BigDecimal netTotal;
    private BigDecimal baseNetTotal;
    private BigDecimal totalTaxesAndCharges;
    private BigDecimal baseTotalTaxesAndCharges;
    private BigDecimal discountAmount;
    private BigDecimal additionalDiscountPercentage;
    private DiscountApplyOn applyDiscountOn;
    private BigDecimal grandTotal;
    private BigDecimal baseGrandTotal;
    private BigDecimal advancePaid;
    
    private BigDecimal perDelivered;
    private BigDecimal perBilled;
    private BigDecimal perPicked;
    private Boolean reserveStock;
    private Boolean skipDeliveryNote;
    
    private String paymentTermsTemplate;
    private String termsAndConditions;
    
    private BigDecimal amountEligibleForCommission;
    private BigDecimal commissionRate;
    private BigDecimal totalCommission;
    
    private List<SalesOrderItemDto> items;
    private List<SalesTaxAndChargeDto> taxes;
    private List<SalesTeamMemberDto.MemberDto> salesTeam;
    private List<SalesTeamMemberDto.ScheduleDto> paymentSchedules;
    private List<SalesTeamMemberDto.ReservationDto> stockReservations;
    
    private OffsetDateTime createdAt;
    private OffsetDateTime submittedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesOrderItemDto {
        private UUID id;
        private Integer idx;
        private UUID itemId;
        private String itemCode;
        private String itemName;
        private String description;
        private String warehouse;
        private LocalDate deliveryDate;
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
        private BigDecimal deliveredQty;
        private BigDecimal billedAmt;
        private BigDecimal pickedQty;
        private Boolean deliveredBySupplier;
        private Boolean grantCommission;
    }
}
