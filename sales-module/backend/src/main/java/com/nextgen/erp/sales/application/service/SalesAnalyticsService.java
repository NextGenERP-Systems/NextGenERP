package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.application.dto.SalesAnalyticsSummaryDto;
import com.nextgen.erp.sales.domain.model.Quotation;
import com.nextgen.erp.sales.domain.model.QuotationStatus;
import com.nextgen.erp.sales.domain.model.SalesOrder;
import com.nextgen.erp.sales.domain.model.SalesOrderStatus;
import com.nextgen.erp.sales.infrastructure.repository.QuotationRepository;
import com.nextgen.erp.sales.infrastructure.repository.SalesOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesAnalyticsService {

    private final SalesOrderRepository salesOrderRepository;
    private final QuotationRepository quotationRepository;

    @Transactional(readOnly = true)
    public SalesAnalyticsSummaryDto getSalesAnalytics() {
        List<SalesOrder> allOrders = salesOrderRepository.findAll();
        List<Quotation> allQuotations = quotationRepository.findAll();

        BigDecimal confirmedRevenue = salesOrderRepository.sumTotalConfirmedRevenue();
        if (confirmedRevenue == null) confirmedRevenue = BigDecimal.ZERO;

        long totalOrders = allOrders.size();
        long pendingFulfillment = allOrders.stream()
                .filter(o -> o.getStatus() == SalesOrderStatus.TO_DELIVER_AND_BILL || o.getStatus() == SalesOrderStatus.TO_DELIVER)
                .count();

        long openQuotations = allQuotations.stream()
                .filter(q -> q.getStatus() == QuotationStatus.OPEN || q.getStatus() == QuotationStatus.REPLIED)
                .count();

        BigDecimal totalPipeline = allQuotations.stream()
                .filter(q -> q.getStatus() == QuotationStatus.OPEN || q.getStatus() == QuotationStatus.REPLIED)
                .map(Quotation::getGrandTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgOrderValue = totalOrders > 0
                ? confirmedRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Monthly trends
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        Map<String, List<SalesOrder>> byMonth = allOrders.stream()
                .collect(Collectors.groupingBy(o -> o.getTransactionDate().format(monthFormatter)));

        List<SalesAnalyticsSummaryDto.MonthlySalesTrendDto> monthlyTrends = byMonth.entrySet().stream()
                .map(e -> {
                    BigDecimal rev = e.getValue().stream()
                            .map(SalesOrder::getGrandTotal)
                            .filter(Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return SalesAnalyticsSummaryDto.MonthlySalesTrendDto.builder()
                            .month(e.getKey())
                            .revenue(rev)
                            .orderCount(e.getValue().size())
                            .build();
                })
                .collect(Collectors.toList());

        // Top Customers
        Map<String, List<SalesOrder>> byCustomer = allOrders.stream()
                .collect(Collectors.groupingBy(SalesOrder::getCustomerName));

        List<SalesAnalyticsSummaryDto.TopCustomerRevenueDto> topCustomers = byCustomer.entrySet().stream()
                .map(e -> {
                    BigDecimal rev = e.getValue().stream()
                            .map(SalesOrder::getGrandTotal)
                            .filter(Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return SalesAnalyticsSummaryDto.TopCustomerRevenueDto.builder()
                            .customerName(e.getKey())
                            .totalRevenue(rev)
                            .ordersCount(e.getValue().size())
                            .build();
                })
                .sorted((a, b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()))
                .limit(5)
                .collect(Collectors.toList());

        return SalesAnalyticsSummaryDto.builder()
                .totalConfirmedRevenue(confirmedRevenue)
                .totalSalesOrders(totalOrders)
                .pendingFulfillmentOrders(pendingFulfillment)
                .openQuotations(openQuotations)
                .averageOrderValue(avgOrderValue)
                .totalPipelineValue(totalPipeline)
                .monthlyTrends(monthlyTrends)
                .topCustomers(topCustomers)
                .salesTeamPerformance(List.of(
                        SalesAnalyticsSummaryDto.SalesPersonPerformanceDto.builder()
                                .salesPersonName("Sarah Jenkins (Account Lead)")
                                .totalSales(new BigDecimal("21000.00"))
                                .incentivesEarned(new BigDecimal("1050.00"))
                                .build(),
                        SalesAnalyticsSummaryDto.SalesPersonPerformanceDto.builder()
                                .salesPersonName("Alex Rivera (Solutions Engineer)")
                                .totalSales(new BigDecimal("9000.00"))
                                .incentivesEarned(new BigDecimal("450.00"))
                                .build()
                ))
                .build();
    }
}
