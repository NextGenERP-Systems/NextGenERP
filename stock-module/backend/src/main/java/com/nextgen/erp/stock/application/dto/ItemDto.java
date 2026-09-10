package com.nextgen.erp.stock.application.dto;

import com.nextgen.erp.stock.domain.model.ValuationMethod;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemDto {
    private String id;

    @NotBlank(message = "Item code is required")
    private String itemCode;

    @NotBlank(message = "Item name is required")
    private String itemName;

    private String itemGroupId;
    private String stockUom;
    private Boolean isStockItem;
    private ValuationMethod valuationMethod;
    private BigDecimal standardRate;
    private BigDecimal openingStock;
    private BigDecimal safetyStock;
    private Integer leadTimeDays;
    private Boolean hasVariants;
    private String variantOf;
    private Boolean hasBatchNo;
    private Boolean hasSerialNo;
    private Boolean inspectionRequiredBeforeReceipt;
    private Boolean inspectionRequiredBeforeDelivery;
    private String defaultWarehouseId;
    private String description;
    private String barcode;
    private String imageUrl;
    private Boolean enabled;
}
