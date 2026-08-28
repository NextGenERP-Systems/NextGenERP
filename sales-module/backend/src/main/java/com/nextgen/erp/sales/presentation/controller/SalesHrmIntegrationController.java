package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.service.SalesHrmIntegrationService;
import com.nextgen.erp.sales.application.service.SalesHrmIntegrationService.CustomerOptionDto;
import com.nextgen.erp.sales.application.service.SalesHrmIntegrationService.EmployeeCommissionSummaryDto;
import com.nextgen.erp.sales.application.service.SalesHrmIntegrationService.SalesRepPerformanceDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sales-integration")
@RequiredArgsConstructor
@Tag(name = "Sales-HRM Integration Bridge", description = "Cross-module APIs connecting Sales commissions, sales quotas, and customer accounts with HRM payroll and appraisals")
public class SalesHrmIntegrationController {

    private final SalesHrmIntegrationService integrationService;

    @GetMapping("/commissions")
    @Operation(summary = "Get employee commission breakdown for monthly HRM payroll")
    public ResponseEntity<EmployeeCommissionSummaryDto> getEmployeeCommissions(
            @RequestParam(required = false) String employeeCode,
            @RequestParam(required = false) String salesPersonName
    ) {
        return ResponseEntity.ok(integrationService.getEmployeeCommissionSummary(employeeCode, salesPersonName));
    }

    @GetMapping("/rep-performance")
    @Operation(summary = "Get sales target quota vs actual achievement for HRM Performance Appraisals")
    public ResponseEntity<SalesRepPerformanceDto> getRepPerformance(
            @RequestParam(required = false) String employeeCode,
            @RequestParam(required = false) String salesPersonName
    ) {
        return ResponseEntity.ok(integrationService.getRepPerformance(employeeCode, salesPersonName));
    }

    @GetMapping("/customers-summary")
    @Operation(summary = "Get customer directory for HRM expense claim tagging")
    public ResponseEntity<List<CustomerOptionDto>> getCustomersSummary() {
        return ResponseEntity.ok(integrationService.getCustomersList());
    }
}
