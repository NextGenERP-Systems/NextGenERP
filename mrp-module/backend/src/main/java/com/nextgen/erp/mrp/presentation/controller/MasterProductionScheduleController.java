package com.nextgen.erp.mrp.presentation.controller;

import com.nextgen.erp.mrp.application.service.MasterProductionScheduleService;
import com.nextgen.erp.mrp.domain.entity.MasterProductionSchedule;
import com.nextgen.erp.mrp.domain.entity.ProductionPlan;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mrp/mps")
@RequiredArgsConstructor
@Tag(name = "MPS & Demand Planning", description = "Master Production Schedule APIs")
public class MasterProductionScheduleController {

    private final MasterProductionScheduleService mpsService;

    @GetMapping
    @Operation(summary = "List all Master Production Schedule entries")
    public ResponseEntity<List<MasterProductionSchedule>> getAllSchedules() {
        return ResponseEntity.ok(mpsService.getAllSchedules());
    }

    @PostMapping
    @Operation(summary = "Create a new Master Production Schedule entry")
    public ResponseEntity<MasterProductionSchedule> createSchedule(@RequestBody MasterProductionSchedule mps) {
        return ResponseEntity.ok(mpsService.createSchedule(mps));
    }

    @PostMapping("/{mpsId}/to-production-plan")
    @Operation(summary = "Convert MPS entry directly into an actionable Production Plan")
    public ResponseEntity<ProductionPlan> convertToProductionPlan(@PathVariable String mpsId) {
        return ResponseEntity.ok(mpsService.convertMpsToProductionPlan(mpsId));
    }
}
