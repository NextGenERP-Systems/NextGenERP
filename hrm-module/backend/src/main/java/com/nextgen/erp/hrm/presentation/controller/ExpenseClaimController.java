package com.nextgen.erp.hrm.presentation.controller;

import com.nextgen.erp.hrm.application.service.ExpenseClaimService;
import com.nextgen.erp.hrm.domain.model.ExpenseClaim;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/expenses")
@RequiredArgsConstructor
@Tag(name = "Expense Claims & Reimbursements", description = "Endpoints for employee travel, meal, and operational expense reimbursements")
public class ExpenseClaimController {

    private final ExpenseClaimService expenseClaimService;

    @GetMapping
    @Operation(summary = "Get all submitted expense claims")
    public ResponseEntity<List<ExpenseClaim>> getAllExpenseClaims() {
        return ResponseEntity.ok(expenseClaimService.getAllExpenseClaims());
    }

    @PostMapping
    @Operation(summary = "Submit a new employee expense claim")
    public ResponseEntity<ExpenseClaim> submitExpenseClaim(@RequestBody ExpenseClaim claim) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseClaimService.submitExpenseClaim(claim));
    }

    @Data
    public static class ApproveExpenseRequest {
        private UUID approverId;
        private BigDecimal sanctionedAmount;
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve and sanction expense claim amount")
    public ResponseEntity<ExpenseClaim> approveExpenseClaim(
            @PathVariable UUID id,
            @RequestBody(required = false) ApproveExpenseRequest request) {
        UUID approverId = (request != null) ? request.getApproverId() : null;
        BigDecimal amt = (request != null) ? request.getSanctionedAmount() : null;
        return ResponseEntity.ok(expenseClaimService.approveExpenseClaim(id, approverId, amt));
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "Mark expense reimbursement as disbursed")
    public ResponseEntity<ExpenseClaim> payExpenseClaim(
            @PathVariable UUID id,
            @RequestParam(required = false) String paymentReference) {
        return ResponseEntity.ok(expenseClaimService.payExpenseClaim(id, paymentReference));
    }
}
