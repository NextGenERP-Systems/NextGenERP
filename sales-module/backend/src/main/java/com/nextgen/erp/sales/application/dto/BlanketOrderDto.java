package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.BlanketOrder.BlanketOrderStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlanketOrderDto {
    private UUID id;
    private String blanketOrderNumber;
    private UUID customerId;
    private String customerName;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String company;
    private BlanketOrderStatus status;
    private String termsAndConditions;
    private List<BlanketOrderItemDto> items;
    private OffsetDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlanketOrderItemDto {
        private UUID id;
        private UUID itemId;
        private String itemCode;
        private String itemName;
        private BigDecimal qty;
        private BigDecimal rate;
        private BigDecimal orderedQty;
        private BigDecimal remainingQty;
    }
}
