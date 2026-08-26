package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.SalesAnalyticsSummaryDto;
import com.nextgen.erp.sales.application.service.SalesAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sales/analytics")
@RequiredArgsConstructor
@Tag(name = "Sales Analytics & Metrics", description = "Endpoints for Executive Dashboard KPI metrics, Pipeline Funnel, and Team Performance")
public class SalesAnalyticsController {

    private final SalesAnalyticsService salesAnalyticsService;

    @GetMapping("/summary")
    @Operation(summary = "Get high-level sales KPI summary and performance analytics")
    public ResponseEntity<SalesAnalyticsSummaryDto> getSalesAnalyticsSummary() {
        return ResponseEntity.ok(salesAnalyticsService.getSalesAnalytics());
    }
}
