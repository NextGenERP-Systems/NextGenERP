package com.nextgen.erp.hrm.presentation.controller;

import com.nextgen.erp.hrm.application.service.HrmSalesIntegrationService;
import com.nextgen.erp.hrm.application.service.HrmSalesIntegrationService.CustomerExpenseSummaryDto;
import com.nextgen.erp.hrm.application.service.HrmSalesIntegrationService.SalesEmployeeDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hrm-integration")
@RequiredArgsConstructor
@Tag(name = "HRM-Sales Integration Bridge", description = "Cross-module APIs connecting HRM employee master, expenses, and payroll with Sales operations")
public class HrmSalesIntegrationController {

    private final HrmSalesIntegrationService integrationService;

    @GetMapping("/sales-employees")
    @Operation(summary = "Get list of active sales & business development employees for sales rep linking")
    public ResponseEntity<List<SalesEmployeeDto>> getSalesEmployees() {
        return ResponseEntity.ok(integrationService.getSalesEmployees());
    }

    @GetMapping("/customer-expenses")
    @Operation(summary = "Get expenses and travel claims tagged to a customer")
    public ResponseEntity<CustomerExpenseSummaryDto> getCustomerExpenses(@RequestParam String customerName) {
        return ResponseEntity.ok(integrationService.getExpensesForCustomer(customerName));
    }
}
