package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.SalesPersonCreateRequest;
import com.nextgen.erp.sales.application.dto.SalesPersonDto;
import com.nextgen.erp.sales.application.service.SalesPersonService;
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
@RequestMapping("/api/v1/sales-persons")
@RequiredArgsConstructor
@Tag(name = "Sales Person Management", description = "Endpoints for managing internal sales reps, targets, commission allocations, and team hierarchy")
public class SalesPersonController {

    private final SalesPersonService salesPersonService;

    @GetMapping
    @Operation(summary = "Get all sales persons")
    public ResponseEntity<List<SalesPersonDto>> getAllSalesPersons() {
        return ResponseEntity.ok(salesPersonService.getAllSalesPersons());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get sales person by UUID")
    public ResponseEntity<SalesPersonDto> getSalesPersonById(@PathVariable UUID id) {
        return ResponseEntity.ok(salesPersonService.getSalesPersonById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new sales person")
    public ResponseEntity<SalesPersonDto> createSalesPerson(@Valid @RequestBody SalesPersonCreateRequest request) {
        SalesPersonDto created = salesPersonService.createSalesPerson(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle active/disabled status of a sales person")
    public ResponseEntity<SalesPersonDto> toggleStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(salesPersonService.toggleStatus(id));
    }
}
