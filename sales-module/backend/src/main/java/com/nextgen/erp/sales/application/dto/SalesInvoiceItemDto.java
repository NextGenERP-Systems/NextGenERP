package com.nextgen.erp.sales.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesInvoiceItemDto {
    private UUID id;
    private UUID salesOrderItemId;
    private UUID itemId;
    private String itemCode;
    private String itemName;
    private BigDecimal qty;
    private BigDecimal rate;
    private BigDecimal amount;
    private String incomeAccount;
}
