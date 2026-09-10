package com.nextgen.erp.stock.application.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BinDto {
    private String id;
    private String itemId;
    private String itemCode;
    private String itemName;
    private String warehouseId;
    private String warehouseName;
    private BigDecimal actualQty;
    private BigDecimal orderedQty;
    private BigDecimal reservedQty;
    private BigDecimal indentedQty;
    private BigDecimal plannedQty;
    private BigDecimal projectedQty;
    private BigDecimal valuationRate;
    private BigDecimal stockValue;
}
