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
    @NotNull(message = "Customer ID is required")
    private UUID customerId;
    private LocalDate postingDate;
    private LocalDate dueDate;
    private String paymentTerms;
    private String notes;

    @NotEmpty(message = "Items list cannot be empty")
    private List<ItemEntry> items;

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
}
