package com.nextgen.erp.mrp.presentation.controller;

import com.nextgen.erp.mrp.application.service.ProductionPlanService;
import com.nextgen.erp.mrp.domain.entity.ProductionPlan;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.nextgen.erp.mrp.domain.entity.WorkOrder;

@RestController
@RequestMapping("/api/v1/mrp/production-plans")
@RequiredArgsConstructor
@Tag(name = "Master Production Planning", description = "Consolidated Production Planning & Scheduling APIs")
public class ProductionPlanController {

    private final ProductionPlanService productionPlanService;

    @GetMapping
    @Operation(summary = "Get all production plans")
    public ResponseEntity<List<ProductionPlan>> getAllPlans() {
        return ResponseEntity.ok(productionPlanService.getAllPlans());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get production plan by ID")
    public ResponseEntity<ProductionPlan> getPlanById(@PathVariable String id) {
        return ResponseEntity.ok(productionPlanService.getPlanById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new production plan")
    public ResponseEntity<ProductionPlan> createPlan(@RequestBody ProductionPlan plan) {
        return ResponseEntity.ok(productionPlanService.createProductionPlan(plan));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit production plan for execution")
    public ResponseEntity<ProductionPlan> submitPlan(@PathVariable String id) {
        return ResponseEntity.ok(productionPlanService.submitProductionPlan(id));
    }

    @PostMapping("/{id}/generate-work-orders")
    @Operation(summary = "Generate idempotent Work Orders from a submitted production plan")
    public ResponseEntity<List<WorkOrder>> generateWorkOrders(@PathVariable String id) {
        return ResponseEntity.ok(productionPlanService.generateWorkOrders(id));
    }
}
