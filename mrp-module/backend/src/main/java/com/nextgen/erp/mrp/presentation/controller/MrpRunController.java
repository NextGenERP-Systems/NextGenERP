package com.nextgen.erp.mrp.presentation.controller;

import com.nextgen.erp.mrp.application.service.MrpRunService;
import com.nextgen.erp.mrp.domain.entity.ProductionPlan;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/mrp/runs")
@RequiredArgsConstructor
@Tag(name = "MRP Run Review", description = "Persisted MRP calculation snapshots and planner review")
public class MrpRunController {

    private final MrpRunService mrpRunService;

    @GetMapping
    @Operation(summary = "List persisted MRP runs and requirement snapshots")
    public ResponseEntity<List<Map<String, Object>>> getRuns() {
        return ResponseEntity.ok(mrpRunService.getRuns());
    }

    @GetMapping("/{runId}")
    @Operation(summary = "Get a persisted MRP run and its requirement snapshots")
    public ResponseEntity<Map<String, Object>> getRun(@PathVariable UUID runId) {
        return ResponseEntity.ok(mrpRunService.getRun(runId));
    }

    @PostMapping("/{runId}/review")
    @Operation(summary = "Mark a calculated MRP run as reviewed")
    public ResponseEntity<Map<String, Object>> reviewRun(@PathVariable UUID runId) {
        return ResponseEntity.ok(mrpRunService.reviewRun(runId));
    }

    @PostMapping("/{runId}/release")
    @Operation(summary = "Release a reviewed MRP run for isolated MRP execution")
    public ResponseEntity<Map<String, Object>> releaseRun(@PathVariable UUID runId) {
        return ResponseEntity.ok(mrpRunService.releaseRun(runId));
    }

    @PostMapping("/{runId}/production-plan")
    @Operation(summary = "Create an idempotent MRP production plan from a released run")
    public ResponseEntity<ProductionPlan> createProductionPlan(@PathVariable UUID runId) {
        return ResponseEntity.ok(mrpRunService.createProductionPlan(runId));
    }
}
