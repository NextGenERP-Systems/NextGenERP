package com.nextgen.erp.sales.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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
public class PurchaseRequisitionCreateRequest {

    private UUID salesOrderId;
    private String salesOrderNumber;
    private UUID customerId;
    private String customerName;
    private String shippingAddress;

    @NotBlank(message = "Supplier name is required")
    private String supplierName;

    @Builder.Default
    private String requisitionType = "DROP_SHIP";

    private LocalDate requiredDate;
    private String notes;

    @NotEmpty(message = "Requisition must contain at least one item")
    private List<RequisitionItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RequisitionItemRequest {
        private UUID salesOrderItemId;
        private UUID itemId;
        private String itemCode;
        private String itemName;
        private BigDecimal qty;
        private BigDecimal rate;
        private String uom;
        private String supplierName;
    }
}
