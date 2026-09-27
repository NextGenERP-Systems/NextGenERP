package com.nextgen.erp.sales.application.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackingSlipCreateRequest {

    @NotNull(message = "Delivery Note ID is required")
    private UUID deliveryNoteId;

    @Builder.Default
    private Integer fromPackageNo = 1;

    @Builder.Default
    private Integer toPackageNo = 1;

    @Builder.Default
    private String packageType = "Carton";

    private BigDecimal netWeightPkg;
    private BigDecimal grossWeightPkg;

    @Builder.Default
    private String weightUom = "Kg";

    private String letterOfCredit;
    private String shippingMark;
    private String notes;

    @NotEmpty(message = "Packing slip must contain at least one item")
    private List<PackingSlipItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackingSlipItemRequest {
        private UUID deliveryNoteItemId;
        private String itemCode;
        private String itemName;
        private BigDecimal qty;
        private BigDecimal netWeight;
        private String weightUom;
        private String productBundleItemCode;
    }
}
