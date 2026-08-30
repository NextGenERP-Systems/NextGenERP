package com.nextgen.erp.accounting.presentation.controller;

import com.nextgen.erp.accounting.application.service.FinancialReportService;
import com.nextgen.erp.accounting.application.service.FinancialReportService.BalanceSheetReport;
import com.nextgen.erp.accounting.application.service.FinancialReportService.ProfitAndLossReport;
import com.nextgen.erp.accounting.application.service.FinancialReportService.TrialBalanceReport;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Financial Statements & Analytics", description = "Endpoints for dynamic Balance Sheet, Profit & Loss, and Trial Balance reports")
public class FinancialReportController {

    private final FinancialReportService reportService;

    @GetMapping("/profit-and-loss")
    @Operation(summary = "Generate live Profit & Loss (P&L) Statement")
    public ResponseEntity<ProfitAndLossReport> getProfitAndLoss() {
        return ResponseEntity.ok(reportService.getProfitAndLoss());
    }

    @GetMapping("/balance-sheet")
    @Operation(summary = "Generate live Balance Sheet (Assets = Liabilities + Equity)")
    public ResponseEntity<BalanceSheetReport> getBalanceSheet() {
        return ResponseEntity.ok(reportService.getBalanceSheet());
    }

    @GetMapping("/trial-balance")
    @Operation(summary = "Generate live Trial Balance across all accounts")
    public ResponseEntity<TrialBalanceReport> getTrialBalance() {
        return ResponseEntity.ok(reportService.getTrialBalance());
    }

    @GetMapping("/cash-flow")
    @Operation(summary = "Generate live Cash Flow Statement")
    public ResponseEntity<FinancialReportService.CashFlowReport> getCashFlow() {
        return ResponseEntity.ok(reportService.getCashFlowStatement());
    }
}
