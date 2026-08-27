package com.nextgen.erp.sales.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InactiveCustomerReportDto {
    private UUID customerId;
    private String customerCode;
    private String customerName;
    private String customerGroup;
    private String territory;
    private String lastOrderDate;
    private long daysSinceLastOrder;
    private long totalHistoricalOrders;
    private BigDecimal lifetimeRevenue;
    private String churnRiskLevel;
}
