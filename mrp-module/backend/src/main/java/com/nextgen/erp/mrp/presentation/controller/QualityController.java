package com.nextgen.erp.mrp.presentation.controller;

import com.nextgen.erp.mrp.application.service.QualityService;
import com.nextgen.erp.mrp.domain.entity.QualityInspection;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mrp/quality")
@RequiredArgsConstructor
@Tag(name = "Quality Control & Inspection", description = "Shop Floor Quality Inspection APIs")
public class QualityController {

    private final QualityService qualityService;

    @GetMapping("/inspections")
    @Operation(summary = "Get all quality inspections")
    public ResponseEntity<List<QualityInspection>> getAllInspections() {
        return ResponseEntity.ok(qualityService.getAllInspections());
    }

    @GetMapping("/inspections/{id}")
    @Operation(summary = "Get quality inspection by ID")
    public ResponseEntity<QualityInspection> getInspectionById(@PathVariable String id) {
        return ResponseEntity.ok(qualityService.getInspectionById(id));
    }

    @GetMapping("/inspections/work-order/{workOrderId}")
    @Operation(summary = "Get quality inspections for a Work Order")
    public ResponseEntity<List<QualityInspection>> getInspectionsByWorkOrder(@PathVariable String workOrderId) {
        return ResponseEntity.ok(qualityService.getInspectionsByWorkOrder(workOrderId));
    }

    @PostMapping("/inspections")
    @Operation(summary = "Submit a new quality inspection")
    public ResponseEntity<QualityInspection> createInspection(@RequestBody QualityInspection inspection) {
        return ResponseEntity.ok(qualityService.createInspection(inspection));
    }
}
