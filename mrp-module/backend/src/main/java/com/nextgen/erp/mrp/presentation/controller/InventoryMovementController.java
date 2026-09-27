package com.nextgen.erp.mrp.presentation.controller;

import com.nextgen.erp.mrp.application.service.InventoryMovementService;
import com.nextgen.erp.mrp.domain.entity.InventoryMovement;
import com.nextgen.erp.mrp.presentation.dto.InventoryMovementRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mrp/inventory-movements")
@RequiredArgsConstructor
@Tag(name = "MRP Inventory Movements", description = "MRP-local material movement ledger")
public class InventoryMovementController {

    private final InventoryMovementService inventoryMovementService;

    @PostMapping
    @Operation(summary = "Record an idempotent MRP-local inventory movement")
    public ResponseEntity<InventoryMovement> record(@RequestBody InventoryMovementRequest request) {
        return ResponseEntity.ok(inventoryMovementService.recordMovement(
                request.itemCode(), request.warehouseId(), request.quantity(), request.movementType(),
                request.workOrderId(), request.sourceReference()));
    }

    @GetMapping("/work-order/{workOrderId}")
    @Operation(summary = "List material movements recorded for a work order")
    public ResponseEntity<List<InventoryMovement>> getForWorkOrder(@PathVariable String workOrderId) {
        return ResponseEntity.ok(inventoryMovementService.getMovementsForWorkOrder(workOrderId));
    }
}
