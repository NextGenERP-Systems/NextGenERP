package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.SalesTargetCreateRequest;
import com.nextgen.erp.sales.application.dto.SalesTargetDto;
import com.nextgen.erp.sales.application.dto.TargetVarianceReportDto;
import com.nextgen.erp.sales.application.service.SalesTargetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sales-targets")
@RequiredArgsConstructor
@Tag(name = "Sales Targets & Variance Analytics", description = "Endpoints for defining quota targets by rep/territory and tracking achievement pacing variance")
public class SalesTargetController {

    private final SalesTargetService salesTargetService;

    @GetMapping
    @Operation(summary = "Get all configured sales targets for a fiscal year")
    public ResponseEntity<List<SalesTargetDto>> getAllTargets(
            @RequestParam(required = false, defaultValue = "2026") String fiscalYear) {
        return ResponseEntity.ok(salesTargetService.getAllTargets(fiscalYear));
    }

    @PostMapping
    @Operation(summary = "Create or update sales quota target for a sales person or territory")
    public ResponseEntity<SalesTargetDto> createOrUpdateTarget(@Valid @RequestBody SalesTargetCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(salesTargetService.createOrUpdateTarget(request));
    }

    @GetMapping("/variance/sales-persons")
    @Operation(summary = "Get Sales Person Target vs. Actual Variance analysis report")
    public ResponseEntity<List<TargetVarianceReportDto>> getSalesPersonTargetVariance(
            @RequestParam(required = false, defaultValue = "2026") String fiscalYear) {
        return ResponseEntity.ok(salesTargetService.getSalesPersonTargetVariance(fiscalYear));
    }

    @GetMapping("/variance/territories")
    @Operation(summary = "Get Territory Target vs. Actual Variance analysis report")
    public ResponseEntity<List<TargetVarianceReportDto>> getTerritoryTargetVariance(
            @RequestParam(required = false, defaultValue = "2026") String fiscalYear) {
        return ResponseEntity.ok(salesTargetService.getTerritoryTargetVariance(fiscalYear));
    }
}
