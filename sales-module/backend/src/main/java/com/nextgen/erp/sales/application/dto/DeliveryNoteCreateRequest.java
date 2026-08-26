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
public class DeliveryNoteCreateRequest {
    private UUID salesOrderId;
    @NotNull(message = "Customer ID is required")
    private UUID customerId;
    private LocalDate postingDate;
    private String carrier;
    private String trackingNumber;
    private String shippingAddress;
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
        private String uom;
        private BigDecimal rate;
        private String warehouse;
    }
}
