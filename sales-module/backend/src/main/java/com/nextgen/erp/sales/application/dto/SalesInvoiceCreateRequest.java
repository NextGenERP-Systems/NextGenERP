package com.nextgen.erp.sales.application.dto;

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
public class SalesInvoiceCreateRequest {
    private UUID salesOrderId;
    private UUID deliveryNoteId;
    private Boolean isReturn;
    private UUID returnAgainstId;
    private String returnAgainstNumber;
    @NotNull(message = "Customer ID is required")
    private UUID customerId;
    private LocalDate postingDate;
    private LocalDate dueDate;
    private String currency;
    private BigDecimal conversionRate;
    private String paymentTerms;
    private String notes;
    private UUID salesPartnerId;
    private String salesPartnerName;
    private BigDecimal commissionRate;

    @NotEmpty(message = "Items list cannot be empty")
    private List<ItemEntry> items;

    private List<TaxEntry> taxes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemEntry {
        private UUID salesOrderItemId;
        private UUID itemId;
        private String itemCode;
        private String itemName;
        private BigDecimal qty;
        private BigDecimal rate;
        private String incomeAccount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaxEntry {
        private com.nextgen.erp.sales.domain.model.TaxChargeType chargeType;
        private Integer rowId;
        private String accountHead;
        private String description;
        private BigDecimal rate;
    }
}
