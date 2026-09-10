package com.nextgen.erp.stock.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockLedgerEntryDto {
    private String id;
    private String itemId;
    private String itemCode;
    private String itemName;
    private String warehouseId;
    private String warehouseName;
    private LocalDate postingDate;
    private LocalTime postingTime;
    private String voucherType;
    private String voucherNo;
    private BigDecimal actualQty;
    private BigDecimal qtyAfterTransaction;
    private BigDecimal incomingRate;
    private BigDecimal valuationRate;
    private BigDecimal stockValue;
    private BigDecimal stockValueDifference;
    private String batchId;
    private String serialNos;
    private Boolean isCancelled;
    private String fiscalYear;
    private String remarks;
    private ZonedDateTime createdAt;
}
