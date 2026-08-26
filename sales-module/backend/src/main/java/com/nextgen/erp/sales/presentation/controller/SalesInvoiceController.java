package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.SalesInvoiceCreateRequest;
import com.nextgen.erp.sales.application.dto.SalesInvoiceDto;
import com.nextgen.erp.sales.application.service.SalesInvoiceService;
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
@RequestMapping("/api/v1/sales-invoices")
@RequiredArgsConstructor
@Tag(name = "Billing & Sales Invoices", description = "Endpoints for invoicing, accounts receivable, and billing status tracking")
public class SalesInvoiceController {

    private final SalesInvoiceService salesInvoiceService;

    @GetMapping
    @Operation(summary = "Get all sales invoices")
    public ResponseEntity<List<SalesInvoiceDto>> getAllSalesInvoices() {
        return ResponseEntity.ok(salesInvoiceService.getAllSalesInvoices());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get sales invoice by ID")
    public ResponseEntity<SalesInvoiceDto> getSalesInvoiceById(@PathVariable UUID id) {
        return ResponseEntity.ok(salesInvoiceService.getSalesInvoiceById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new sales invoice")
    public ResponseEntity<SalesInvoiceDto> createSalesInvoice(@Valid @RequestBody SalesInvoiceCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(salesInvoiceService.createSalesInvoice(request));
    }

    @PostMapping("/from-order/{salesOrderId}")
    @Operation(summary = "Generate sales invoice from an existing Sales Order")
    public ResponseEntity<SalesInvoiceDto> makeFromSalesOrder(@PathVariable UUID salesOrderId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(salesInvoiceService.makeFromSalesOrder(salesOrderId));
    }

    @PostMapping("/from-delivery/{deliveryNoteId}")
    @Operation(summary = "Generate sales invoice from an existing Delivery Note")
    public ResponseEntity<SalesInvoiceDto> makeFromDeliveryNote(@PathVariable UUID deliveryNoteId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(salesInvoiceService.makeFromDeliveryNote(deliveryNoteId));
    }
}
