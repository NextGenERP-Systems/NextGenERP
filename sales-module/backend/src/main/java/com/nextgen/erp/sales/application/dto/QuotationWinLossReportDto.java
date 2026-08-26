package com.nextgen.erp.sales.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationWinLossReportDto {
    private long totalQuotations;
    private long wonQuotations;
    private long lostQuotations;
    private long openQuotations;
    private long expiredQuotations;
    private BigDecimal winRatePercentage;
    private BigDecimal totalPipelineValue;
    private BigDecimal wonValue;
    private BigDecimal lostValue;
    private Map<String, Long> lostReasonsCount;
    private Map<String, BigDecimal> lostReasonsValue;
}
