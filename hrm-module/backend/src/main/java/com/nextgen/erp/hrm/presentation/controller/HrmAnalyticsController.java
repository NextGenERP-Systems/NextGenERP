package com.nextgen.erp.hrm.presentation.controller;

import com.nextgen.erp.hrm.application.service.HrmAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "HR Analytics & KPIs", description = "Executive HR metrics, headcount distribution, and payroll trends")
public class HrmAnalyticsController {

    private final HrmAnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get high-level executive HR dashboard metrics")
    public ResponseEntity<HrmAnalyticsService.HrmDashboardKpis> getDashboardMetrics() {
        return ResponseEntity.ok(analyticsService.getDashboardKpis());
    }
}
