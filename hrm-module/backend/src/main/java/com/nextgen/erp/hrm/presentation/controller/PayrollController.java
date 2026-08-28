package com.nextgen.erp.hrm.presentation.controller;

import com.nextgen.erp.hrm.application.service.PayrollService;
import com.nextgen.erp.hrm.domain.model.SalarySlip;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payroll")
@RequiredArgsConstructor
@Tag(name = "Payroll & Salary Engine", description = "Endpoints for batch payroll processing, salary structures, and salary slips")
public class PayrollController {

    private final PayrollService payrollService;

    @GetMapping("/slips")
    @Operation(summary = "Get all salary slips across all employees")
    public ResponseEntity<List<SalarySlip>> getAllSalarySlips() {
        return ResponseEntity.ok(payrollService.getAllSalarySlips());
    }

    @GetMapping("/slips/{id}")
    @Operation(summary = "Get detailed salary slip by ID with breakdown")
    public ResponseEntity<SalarySlip> getSalarySlipById(@PathVariable UUID id) {
        return payrollService.getSalarySlipById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/slips/employee/{employeeId}")
    @Operation(summary = "Get payroll history for a specific employee")
    public ResponseEntity<List<SalarySlip>> getEmployeeSalarySlips(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(payrollService.getEmployeeSalarySlips(employeeId));
    }

    @Data
    public static class BatchPayrollRequest {
        private LocalDate startDate;
        private LocalDate endDate;
        private LocalDate postingDate;
    }

    @PostMapping("/generate-batch")
    @Operation(summary = "Batch generate monthly salary slips for all active employees")
    public ResponseEntity<List<SalarySlip>> generateBatchPayroll(@RequestBody BatchPayrollRequest request) {
        LocalDate start = (request.getStartDate() != null) ? request.getStartDate() : LocalDate.now().withDayOfMonth(1);
        LocalDate end = (request.getEndDate() != null) ? request.getEndDate() : LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        LocalDate posting = (request.getPostingDate() != null) ? request.getPostingDate() : end;

        return ResponseEntity.ok(payrollService.generateBatchPayroll(start, end, posting));
    }

    @PostMapping("/slips/{id}/submit")
    @Operation(summary = "Submit draft salary slip for payment authorization")
    public ResponseEntity<SalarySlip> submitSalarySlip(@PathVariable UUID id) {
        return ResponseEntity.ok(payrollService.submitSalarySlip(id));
    }

    @PostMapping("/slips/{id}/pay")
    @Operation(summary = "Mark salary slip as paid and record bank transaction reference")
    public ResponseEntity<SalarySlip> paySalarySlip(
            @PathVariable UUID id,
            @RequestParam(required = false) String paymentReference) {
        return ResponseEntity.ok(payrollService.paySalarySlip(id, paymentReference));
    }
}
