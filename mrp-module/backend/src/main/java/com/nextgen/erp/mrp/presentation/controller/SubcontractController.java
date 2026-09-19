package com.nextgen.erp.mrp.presentation.controller;

import com.nextgen.erp.mrp.application.service.SubcontractService;
import com.nextgen.erp.mrp.domain.entity.SubcontractOrder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mrp/subcontracting")
@RequiredArgsConstructor
@Tag(name = "Subcontracting", description = "Subcontracting & External Processing APIs")
public class SubcontractController {

    private final SubcontractService subcontractService;

    @GetMapping
    @Operation(summary = "List all Subcontract Orders")
    public ResponseEntity<List<SubcontractOrder>> getAllSubcontractOrders() {
        return ResponseEntity.ok(subcontractService.getAllSubcontractOrders());
    }

    @PostMapping
    @Operation(summary = "Create a new Subcontract Order for external vendor processing")
    public ResponseEntity<SubcontractOrder> createSubcontractOrder(@RequestBody SubcontractOrder order) {
        return ResponseEntity.ok(subcontractService.createSubcontractOrder(order));
    }

    @PatchMapping("/{subcontractId}/status")
    @Operation(summary = "Update status of a Subcontract Order")
    public ResponseEntity<SubcontractOrder> updateStatus(
            @PathVariable String subcontractId,
            @RequestParam String status) {
        return ResponseEntity.ok(subcontractService.updateStatus(subcontractId, status));
    }

    @PostMapping("/{subcontractId}/dispatch-materials")
    @Operation(summary = "Transfer raw materials from stores to subcontractor WIP warehouse")
    public ResponseEntity<SubcontractOrder> dispatchMaterials(@PathVariable String subcontractId) {
        return ResponseEntity.ok(subcontractService.dispatchMaterials(subcontractId));
    }

    @PostMapping("/{subcontractId}/receive-goods")
    @Operation(summary = "Receive completed processed goods from subcontractor")
    public ResponseEntity<SubcontractOrder> receiveGoods(@PathVariable String subcontractId) {
        return ResponseEntity.ok(subcontractService.receiveGoods(subcontractId));
    }
}
