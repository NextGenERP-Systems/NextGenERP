package com.nextgen.erp.sales.application.dto;

import com.nextgen.erp.sales.domain.model.TaxChargeType;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesTaxAndChargeDto {
    private UUID id;
    private Integer idx;
    private TaxChargeType chargeType;
    private Integer rowId;
    private String accountHead;
    private String description;
    private BigDecimal rate;
    private BigDecimal taxAmount;
    private BigDecimal total;
    private BigDecimal baseTaxAmount;
    private BigDecimal baseTotal;
}
