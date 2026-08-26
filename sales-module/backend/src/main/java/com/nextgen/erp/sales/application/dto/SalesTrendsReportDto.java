package com.nextgen.erp.sales.application.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesTrendsReportDto {
    private String period; // e.g. "2026-08"
    private long salesOrdersCount;
    private BigDecimal confirmedRevenue;
    private long quotationsCount;
    private BigDecimal quotationValue;
    private BigDecimal winConversionRate;
}
