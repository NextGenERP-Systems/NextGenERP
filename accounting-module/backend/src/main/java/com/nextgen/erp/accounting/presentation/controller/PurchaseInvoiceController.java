package com.nextgen.erp.accounting.presentation.controller;

import com.nextgen.erp.accounting.application.service.PurchaseInvoiceService;
import com.nextgen.erp.accounting.domain.model.PurchaseInvoice;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/purchase-invoices")
@RequiredArgsConstructor
@Tag(name = "Accounts Payable (Purchase Invoices)", description = "Endpoints for vendor bills and supplier expense logging")
public class PurchaseInvoiceController {

    private final PurchaseInvoiceService purchaseInvoiceService;

    @GetMapping
    @Operation(summary = "Get all Purchase Invoices")
    public ResponseEntity<List<PurchaseInvoice>> getAllPurchaseInvoices() {
        return ResponseEntity.ok(purchaseInvoiceService.getAllPurchaseInvoices());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Purchase Invoice by UUID")
    public ResponseEntity<PurchaseInvoice> getPurchaseInvoiceById(@PathVariable UUID id) {
        return purchaseInvoiceService.getPurchaseInvoiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create and post a new Purchase Invoice / Vendor Bill")
    public ResponseEntity<PurchaseInvoice> createPurchaseInvoice(@RequestBody PurchaseInvoice invoice) {
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseInvoiceService.createPurchaseInvoice(invoice));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Purchase Invoice by UUID")
    public ResponseEntity<Void> deletePurchaseInvoice(@PathVariable UUID id) {
        purchaseInvoiceService.deletePurchaseInvoice(id);
        return ResponseEntity.noContent().build();
    }
}
