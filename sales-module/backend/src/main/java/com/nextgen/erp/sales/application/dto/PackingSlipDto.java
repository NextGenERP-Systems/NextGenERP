package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.PackingSlipStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackingSlipDto {
    private UUID id;
    private String packingSlipNumber;
    private UUID deliveryNoteId;
    private String deliveryNoteNumber;
    private Integer fromPackageNo;
    private Integer toPackageNo;
    private Integer totalPackages;
    private String packageType;
    private BigDecimal netWeightPkg;
    private BigDecimal grossWeightPkg;
    private String weightUom;
    private String letterOfCredit;
    private String shippingMark;
    private PackingSlipStatus status;
    private String notes;
    private List<PackingSlipItemDto> items;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackingSlipItemDto {
        private UUID id;
        private UUID deliveryNoteItemId;
        private String itemCode;
        private String itemName;
        private BigDecimal qty;
        private BigDecimal netWeight;
        private String weightUom;
        private String productBundleItemCode;
    }
}
