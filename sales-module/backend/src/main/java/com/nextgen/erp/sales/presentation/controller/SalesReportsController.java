package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.*;
import com.nextgen.erp.sales.application.service.SalesReportsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Sales Intelligence & Reports", description = "Endpoints for Order Analysis, AR Aging, Quotation Win/Loss Funnel, and Item Sales")
public class SalesReportsController {

    private final SalesReportsService reportsService;

    @GetMapping("/sales-order-analysis")
    @Operation(summary = "Sales Order Analysis Report (Ordered vs Delivered vs Billed)")
    public ResponseEntity<List<SalesOrderAnalysisReportDto>> getSalesOrderAnalysis() {
        return ResponseEntity.ok(reportsService.getSalesOrderAnalysis());
    }

    @GetMapping("/customer-credit-aging")
    @Operation(summary = "Customer Credit Balance and AR Aging Report (0-30, 31-60, 61-90, 90+ days)")
    public ResponseEntity<List<CustomerCreditAgingReportDto>> getCustomerCreditAging() {
        return ResponseEntity.ok(reportsService.getCustomerCreditAging());
    }

    @GetMapping("/win-loss-funnel")
    @Operation(summary = "Quotation Win/Loss and Conversion Funnel Report")
    public ResponseEntity<QuotationWinLossReportDto> getQuotationWinLossFunnel() {
        return ResponseEntity.ok(reportsService.getQuotationWinLossFunnel());
    }

    @GetMapping("/item-sales-history")
    @Operation(summary = "Item-Wise Sales and Revenue Analysis Report")
    public ResponseEntity<List<ItemSalesHistoryReportDto>> getItemSalesHistory() {
        return ResponseEntity.ok(reportsService.getItemSalesHistory());
    }

    @GetMapping("/sales-trends")
    @Operation(summary = "Monthly Sales Orders and Quotation Trends Report")
    public ResponseEntity<List<SalesTrendsReportDto>> getSalesTrendsReport() {
        return ResponseEntity.ok(reportsService.getSalesTrendsReport());
    }

    @GetMapping("/customer-acquisition")
    @Operation(summary = "Customer Acquisition, Lifetime Value, and Cohort Report")
    public ResponseEntity<List<CustomerAcquisitionReportDto>> getCustomerAcquisitionReport() {
        return ResponseEntity.ok(reportsService.getCustomerAcquisitionReport());
    }
}
