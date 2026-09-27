package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.PurchaseRequisition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequisitionDto {
    private UUID id;
    private String requisitionNumber;
    private UUID salesOrderId;
    private String salesOrderNumber;
    private UUID customerId;
    private String customerName;
    private String shippingAddress;
    private String supplierName;
    private String requisitionType;
    private PurchaseRequisition.RequisitionStatus status;
    private LocalDate transactionDate;
    private LocalDate requiredDate;
    private BigDecimal totalQty;
    private BigDecimal netTotal;
    private String notes;
    @Builder.Default
    private List<RequisitionItemDto> items = new ArrayList<>();
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RequisitionItemDto {
        private UUID id;
        private UUID salesOrderItemId;
        private UUID itemId;
        private String itemCode;
        private String itemName;
        private BigDecimal qty;
        private BigDecimal rate;
        private BigDecimal amount;
        private String uom;
        private String supplierName;
    }
}
