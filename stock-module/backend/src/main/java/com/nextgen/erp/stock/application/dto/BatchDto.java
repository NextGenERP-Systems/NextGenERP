package com.nextgen.erp.stock.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchDto {
    private String id;
    private String batchId;
    private String itemId;
    private String itemCode;
    private String itemName;
    private LocalDate manufacturingDate;
    private LocalDate expiryDate;
    private BigDecimal batchQty;
    private String supplierBatchNo;
    private String description;
    private Boolean isDisabled;
}
