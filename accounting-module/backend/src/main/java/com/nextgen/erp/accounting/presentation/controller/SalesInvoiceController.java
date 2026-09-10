package com.nextgen.erp.accounting.presentation.controller;

import com.nextgen.erp.accounting.application.service.SalesInvoiceService;
import com.nextgen.erp.accounting.domain.model.SalesInvoice;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sales-invoices")
@RequiredArgsConstructor
@Tag(name = "Accounts Receivable (Sales Invoices)", description = "Endpoints for customer billing and tax invoices")
public class SalesInvoiceController {

    private final SalesInvoiceService salesInvoiceService;

    @GetMapping
    @Operation(summary = "Get all Sales Invoices")
    public ResponseEntity<List<SalesInvoice>> getAllSalesInvoices() {
        return ResponseEntity.ok(salesInvoiceService.getAllSalesInvoices());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Sales Invoice by UUID")
    public ResponseEntity<SalesInvoice> getSalesInvoiceById(@PathVariable UUID id) {
        return salesInvoiceService.getSalesInvoiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create and submit a new Sales Invoice")
    public ResponseEntity<SalesInvoice> createSalesInvoice(@RequestBody SalesInvoice invoice) {
        return ResponseEntity.status(HttpStatus.CREATED).body(salesInvoiceService.createSalesInvoice(invoice));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Sales Invoice by UUID")
    public ResponseEntity<Void> deleteSalesInvoice(@PathVariable UUID id) {
        salesInvoiceService.deleteSalesInvoice(id);
        return ResponseEntity.noContent().build();
    }
}
