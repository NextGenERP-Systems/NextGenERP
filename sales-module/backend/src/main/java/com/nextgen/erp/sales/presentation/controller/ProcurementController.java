package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.service.ProcurementService;
import com.nextgen.erp.sales.domain.model.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/procurement")
@RequiredArgsConstructor
@Tag(name = "Buying & Procurement", description = "Endpoints for material requests, supplier quotations comparison, purchase orders & 3-way matching")
public class ProcurementController {

    private final ProcurementService procurementService;

    // --- Material Requests ---
    @GetMapping("/material-requests")
    @Operation(summary = "Get all Material Requests / Requisitions")
    public ResponseEntity<List<PurchaseRequisition>> getAllMaterialRequests() {
        return ResponseEntity.ok(procurementService.getAllMaterialRequests());
    }

    @GetMapping("/material-requests/{id}")
    @Operation(summary = "Get Material Request by ID")
    public ResponseEntity<PurchaseRequisition> getMaterialRequestById(@PathVariable UUID id) {
        return procurementService.getMaterialRequestById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/material-requests")
    @Operation(summary = "Create Material Request")
    public ResponseEntity<PurchaseRequisition> createMaterialRequest(@RequestBody PurchaseRequisition req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(procurementService.createMaterialRequest(req));
    }

    // --- Supplier Quotations ---
    @GetMapping("/quotations")
    @Operation(summary = "Get all Supplier Quotations")
    public ResponseEntity<List<SupplierQuotation>> getAllSupplierQuotations() {
        return ResponseEntity.ok(procurementService.getAllSupplierQuotations());
    }

    @GetMapping("/quotations/{id}")
    @Operation(summary = "Get Supplier Quotation by ID")
    public ResponseEntity<SupplierQuotation> getSupplierQuotationById(@PathVariable UUID id) {
        return procurementService.getSupplierQuotationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/quotations")
    @Operation(summary = "Create Supplier Quotation")
    public ResponseEntity<SupplierQuotation> createSupplierQuotation(@RequestBody SupplierQuotation quote) {
        return ResponseEntity.status(HttpStatus.CREATED).body(procurementService.createSupplierQuotation(quote));
    }

    @GetMapping("/quotations/compare")
    @Operation(summary = "Side-by-side comparative matrix of supplier quotations")
    public ResponseEntity<QuotationComparisonDto> compareQuotations(
            @RequestParam(required = false) UUID materialRequestId) {
        return ResponseEntity.ok(procurementService.compareQuotations(materialRequestId));
    }

    @PostMapping("/quotations/{id}/award-po")
    @Operation(summary = "Award winning quote and generate Purchase Order")
    public ResponseEntity<PurchaseOrder> awardQuotationToPurchaseOrder(@PathVariable UUID id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(procurementService.awardQuotationToPurchaseOrder(id));
    }

    // --- Purchase Orders ---
    @GetMapping("/purchase-orders")
    @Operation(summary = "Get all Purchase Orders")
    public ResponseEntity<List<PurchaseOrder>> getAllPurchaseOrders() {
        return ResponseEntity.ok(procurementService.getAllPurchaseOrders());
    }

    @GetMapping("/purchase-orders/{id}")
    @Operation(summary = "Get Purchase Order by ID")
    public ResponseEntity<PurchaseOrder> getPurchaseOrderById(@PathVariable UUID id) {
        return procurementService.getPurchaseOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/purchase-orders")
    @Operation(summary = "Create Purchase Order")
    public ResponseEntity<PurchaseOrder> createPurchaseOrder(@RequestBody PurchaseOrder po) {
        return ResponseEntity.status(HttpStatus.CREATED).body(procurementService.createPurchaseOrder(po));
    }

    @PutMapping("/purchase-orders/{id}/status")
    @Operation(summary = "Update Purchase Order status")
    public ResponseEntity<PurchaseOrder> updatePurchaseOrderStatus(
            @PathVariable UUID id,
            @RequestParam PurchaseOrder.PurchaseOrderStatus status) {
        return ResponseEntity.ok(procurementService.updatePurchaseOrderStatus(id, status));
    }

    // --- 3-Way Matching Engine ---
    @PostMapping("/three-way-match")
    @Operation(summary = "Perform 3-way reconciliation validation (PO vs Receipt vs Invoice)")
    public ResponseEntity<ThreeWayMatchResultDto> performThreeWayMatching(@RequestBody ThreeWayMatchRequest req) {
        return ResponseEntity.ok(procurementService.performThreeWayMatching(req));
    }
}
