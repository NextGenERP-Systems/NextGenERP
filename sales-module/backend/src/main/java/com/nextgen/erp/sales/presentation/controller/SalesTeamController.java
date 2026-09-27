package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.SalesTeamMemberDto;
import com.nextgen.erp.sales.application.dto.SalesTeamSaveRequest;
import com.nextgen.erp.sales.application.service.SalesTeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sales-team")
@RequiredArgsConstructor
@Tag(name = "Sales Team Multi-Allocation Management", description = "Endpoints for splitting order/invoice contributions across multiple sales representatives with incentive allocations")
public class SalesTeamController {

    private final SalesTeamService salesTeamService;

    @GetMapping("/{voucherType}/{voucherId}")
    @Operation(summary = "Get all allocated sales team members for a voucher (e.g. SALES_ORDER, SALES_INVOICE)")
    public ResponseEntity<List<SalesTeamMemberDto>> getTeamForVoucher(
            @PathVariable String voucherType,
            @PathVariable UUID voucherId) {
        return ResponseEntity.ok(salesTeamService.getTeamForVoucher(voucherType, voucherId));
    }

    @PostMapping("/{voucherType}/{voucherId}")
    @Operation(summary = "Save multi-rep sales team contribution split and commission percentages for a voucher")
    public ResponseEntity<List<SalesTeamMemberDto>> saveTeamForVoucher(
            @PathVariable String voucherType,
            @PathVariable UUID voucherId,
            @Valid @RequestBody SalesTeamSaveRequest request) {
        return ResponseEntity.ok(salesTeamService.saveTeamForVoucher(voucherType, voucherId, request));
    }
}
