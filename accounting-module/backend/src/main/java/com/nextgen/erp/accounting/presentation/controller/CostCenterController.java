package com.nextgen.erp.accounting.presentation.controller;

import com.nextgen.erp.accounting.application.service.CostCenterService;
import com.nextgen.erp.accounting.domain.model.CostCenter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cost-centers")
@RequiredArgsConstructor
@Tag(name = "Cost Centers", description = "Endpoints for department cost centers and budget allocation")
public class CostCenterController {

    private final CostCenterService costCenterService;

    @GetMapping
    @Operation(summary = "Get all Cost Centers")
    public ResponseEntity<List<CostCenter>> getAllCostCenters() {
        return ResponseEntity.ok(costCenterService.getAllCostCenters());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Cost Center by UUID")
    public ResponseEntity<CostCenter> getCostCenterById(@PathVariable UUID id) {
        return costCenterService.getCostCenterById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new Cost Center")
    public ResponseEntity<CostCenter> createCostCenter(@RequestBody CostCenter costCenter) {
        return ResponseEntity.status(HttpStatus.CREATED).body(costCenterService.createCostCenter(costCenter));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Cost Center by UUID")
    public ResponseEntity<Void> deleteCostCenter(@PathVariable UUID id) {
        costCenterService.deleteCostCenter(id);
        return ResponseEntity.noContent().build();
    }
}
