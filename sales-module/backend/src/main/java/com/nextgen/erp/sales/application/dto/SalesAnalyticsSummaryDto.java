package com.nextgen.erp.sales.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesAnalyticsSummaryDto {
    private BigDecimal totalConfirmedRevenue;
    private long totalSalesOrders;
    private long pendingFulfillmentOrders;
    private long openQuotations;
    private BigDecimal averageOrderValue;
    private BigDecimal totalPipelineValue;
    
    private List<MonthlySalesTrendDto> monthlyTrends;
    private List<TopCustomerRevenueDto> topCustomers;
    private List<SalesPersonPerformanceDto> salesTeamPerformance;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlySalesTrendDto {
        private String month;
        private BigDecimal revenue;
        private long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopCustomerRevenueDto {
        private String customerName;
        private BigDecimal totalRevenue;
        private long ordersCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesPersonPerformanceDto {
        private String salesPersonName;
        private BigDecimal totalSales;
        private BigDecimal incentivesEarned;
    }
}
