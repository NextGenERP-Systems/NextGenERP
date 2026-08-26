package com.nextgen.erp.sales.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemSalesHistoryReportDto {
    private UUID itemId;
    private String itemCode;
    private String itemName;
    private String itemGroup;
    private BigDecimal totalQtyOrdered;
    private BigDecimal totalQtyDelivered;
    private BigDecimal totalQtyBilled;
    private BigDecimal totalSalesRevenue;
    private BigDecimal averageSellingRate;
}
