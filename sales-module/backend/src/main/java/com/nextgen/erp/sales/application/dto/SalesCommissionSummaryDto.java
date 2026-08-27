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
public class SalesCommissionSummaryDto {
    private String salesPersonName;
    private long totalOrdersCount;
    private BigDecimal totalAllocatedAmount;
    private BigDecimal avgCommissionRate;
    private BigDecimal totalCommissionEarned;
    private BigDecimal totalIncentivesEarned;
    private BigDecimal totalPayout;
}
