package com.nextgen.erp.sales.application.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
public class BlanketOrderCreateRequest {
    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    @NotNull(message = "From date is required")
    private LocalDate fromDate;

    @NotNull(message = "To date is required")
    private LocalDate toDate;

    private String termsAndConditions;

    @NotEmpty(message = "Items list cannot be empty")
    private List<ItemEntry> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemEntry {
        private UUID itemId;
        private String itemCode;
        private String itemName;
        private BigDecimal qty;
        private BigDecimal rate;
    }
}
