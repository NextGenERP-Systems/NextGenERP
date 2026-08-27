package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.SalesPartnerCreateRequest;
import com.nextgen.erp.sales.application.dto.SalesPartnerDto;
import com.nextgen.erp.sales.application.service.SalesPartnerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sales-partners")
@RequiredArgsConstructor
@Tag(name = "Sales Partner Management", description = "Endpoints for managing external sales partners, distributors, agencies, and commission structures")
public class SalesPartnerController {

    private final SalesPartnerService salesPartnerService;

    @GetMapping
    @Operation(summary = "Get all sales partners")
    public ResponseEntity<List<SalesPartnerDto>> getAllSalesPartners() {
        return ResponseEntity.ok(salesPartnerService.getAllSalesPartners());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get sales partner by UUID")
    public ResponseEntity<SalesPartnerDto> getSalesPartnerById(@PathVariable UUID id) {
        return ResponseEntity.ok(salesPartnerService.getSalesPartnerById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new sales partner")
    public ResponseEntity<SalesPartnerDto> createSalesPartner(@Valid @RequestBody SalesPartnerCreateRequest request) {
        SalesPartnerDto created = salesPartnerService.createSalesPartner(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle active/disabled status of a sales partner")
    public ResponseEntity<SalesPartnerDto> toggleStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(salesPartnerService.toggleStatus(id));
    }
}
