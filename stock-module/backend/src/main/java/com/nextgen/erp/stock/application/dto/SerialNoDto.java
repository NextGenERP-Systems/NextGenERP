package com.nextgen.erp.stock.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SerialNoDto {
    private String id;
    private String serialNo;
    private String itemId;
    private String itemCode;
    private String itemName;
    private String warehouseId;
    private String warehouseName;
    private String batchId;
    private String status;
    private BigDecimal purchaseRate;
    private LocalDate warrantyExpiryDate;
}
