package com.nextgen.erp.sales.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationTrendsReportDto {
    private String period;
    private long totalQuotations;
    private long orderedQuotations;
    private long lostQuotations;
    private long expiredQuotations;
    private BigDecimal totalQuotationValue;
    private BigDecimal wonQuotationValue;
    private BigDecimal conversionRatePercentage;
    private BigDecimal avgTurnaroundDays;
}
