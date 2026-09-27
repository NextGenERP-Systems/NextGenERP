package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.PurchaseRequisitionCreateRequest;
import com.nextgen.erp.sales.application.dto.PurchaseRequisitionDto;
import com.nextgen.erp.sales.application.service.PurchaseRequisitionService;
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
@RequestMapping("/api/v1/purchase-requisitions")
@RequiredArgsConstructor
@Tag(name = "Drop Shipping & Purchase Requisitions", description = "Endpoints for generating back-to-back purchase requisitions from drop-shipped Sales Orders and tracking supplier delivery")
public class PurchaseRequisitionController {

    private final PurchaseRequisitionService purchaseRequisitionService;

    @GetMapping
    @Operation(summary = "Get all purchase requisitions")
    public ResponseEntity<List<PurchaseRequisitionDto>> getAllRequisitions() {
        return ResponseEntity.ok(purchaseRequisitionService.getAllRequisitions());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase requisition by UUID")
    public ResponseEntity<PurchaseRequisitionDto> getRequisitionById(@PathVariable UUID id) {
        return ResponseEntity.ok(purchaseRequisitionService.getRequisitionById(id));
    }

    @GetMapping("/by-order/{salesOrderId}")
    @Operation(summary = "Get purchase requisitions for a specific Sales Order")
    public ResponseEntity<List<PurchaseRequisitionDto>> getRequisitionsBySalesOrder(@PathVariable UUID salesOrderId) {
        return ResponseEntity.ok(purchaseRequisitionService.getRequisitionsBySalesOrder(salesOrderId));
    }

    @PostMapping("/from-sales-order/{salesOrderId}")
    @Operation(summary = "Auto-generate Drop Ship Purchase Requisitions from a Sales Order")
    public ResponseEntity<List<PurchaseRequisitionDto>> createFromSalesOrder(@PathVariable UUID salesOrderId) {
        List<PurchaseRequisitionDto> created = purchaseRequisitionService.createFromSalesOrder(salesOrderId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping
    @Operation(summary = "Create a manual purchase requisition")
    public ResponseEntity<PurchaseRequisitionDto> createRequisition(@Valid @RequestBody PurchaseRequisitionCreateRequest request) {
        PurchaseRequisitionDto created = purchaseRequisitionService.createRequisition(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit purchase requisition")
    public ResponseEntity<PurchaseRequisitionDto> submitRequisition(@PathVariable UUID id) {
        return ResponseEntity.ok(purchaseRequisitionService.submitRequisition(id));
    }

    @PostMapping("/{id}/order-from-supplier")
    @Operation(summary = "Mark requisition ordered from supplier")
    public ResponseEntity<PurchaseRequisitionDto> orderFromSupplier(@PathVariable UUID id) {
        return ResponseEntity.ok(purchaseRequisitionService.orderFromSupplier(id));
    }

    @PostMapping("/{id}/confirm-delivery")
    @Operation(summary = "Confirm supplier drop-ship delivery directly to customer")
    public ResponseEntity<PurchaseRequisitionDto> confirmDelivery(@PathVariable UUID id) {
        return ResponseEntity.ok(purchaseRequisitionService.confirmDelivery(id));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel purchase requisition")
    public ResponseEntity<PurchaseRequisitionDto> cancelRequisition(@PathVariable UUID id) {
        return ResponseEntity.ok(purchaseRequisitionService.cancelRequisition(id));
    }
}
