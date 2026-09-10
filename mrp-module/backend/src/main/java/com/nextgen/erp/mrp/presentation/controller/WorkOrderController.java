package com.nextgen.erp.mrp.presentation.controller;

import com.nextgen.erp.mrp.application.service.WorkOrderService;
import com.nextgen.erp.mrp.domain.entity.WorkOrder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/mrp/work-orders")
@RequiredArgsConstructor
@Tag(name = "Work Order Management", description = "Work Orders, Sub-Assemblies, Real-Time Consumption & Locks")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @GetMapping
    @Operation(summary = "List all Work Orders")
    public ResponseEntity<List<WorkOrder>> getAllWorkOrders() {
        return ResponseEntity.ok(workOrderService.getAllWorkOrders());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Work Order by ID")
    public ResponseEntity<WorkOrder> getWorkOrderById(@PathVariable String id) {
        return ResponseEntity.ok(workOrderService.getWorkOrderById(id));
    }

    @GetMapping("/{id}/children")
    @Operation(summary = "Get Child Work Orders for Sub-Assemblies")
    public ResponseEntity<List<WorkOrder>> getChildWorkOrders(@PathVariable String id) {
        return ResponseEntity.ok(workOrderService.getChildWorkOrders(id));
    }

    @PostMapping("/{id}/consume")
    @Operation(summary = "Log Real-Time Material Consumption with Pessimistic Row Lock and Over-Consumption Tracking")
    public ResponseEntity<WorkOrder> logConsumption(
            @PathVariable String id,
            @RequestParam String itemCode,
            @RequestParam BigDecimal consumeQty
    ) {
        return ResponseEntity.ok(workOrderService.logMaterialConsumption(id, itemCode, consumeQty));
    }
}
