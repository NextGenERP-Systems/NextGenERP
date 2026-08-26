package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.SalesOrderCreateRequest;
import com.nextgen.erp.sales.application.dto.SalesOrderDto;
import com.nextgen.erp.sales.application.service.SalesOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sales-orders")
@RequiredArgsConstructor
@Tag(name = "Sales Order Lifecycle", description = "Endpoints for managing Sales Orders, Submissions, Credit Limits, Stock Reservations, and Fulfilments")
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    @GetMapping
    @Operation(summary = "List all sales orders")
    public ResponseEntity<List<SalesOrderDto>> getAllSalesOrders() {
        return ResponseEntity.ok(salesOrderService.getAllSalesOrders());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get sales order by UUID with items, taxes, and reservations")
    public ResponseEntity<SalesOrderDto> getSalesOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(salesOrderService.getSalesOrderById(id));
    }

    @PostMapping
    @Operation(summary = "Create a draft sales order with tax, pricing, and 100% sales team split validation")
    public ResponseEntity<SalesOrderDto> createSalesOrder(@Valid @RequestBody SalesOrderCreateRequest request) {
        SalesOrderDto created = salesOrderService.createSalesOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit Sales Order: performs customer credit limit verification, creates stock reservation entries, updates balances")
    public ResponseEntity<SalesOrderDto> submitSalesOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(salesOrderService.submitSalesOrder(id));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel Sales Order: releases stock reservations and reverts customer credit balance")
    public ResponseEntity<SalesOrderDto> cancelSalesOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(salesOrderService.cancelSalesOrder(id));
    }

    @PatchMapping("/{id}/fulfillment")
    @Operation(summary = "Update delivery and billing progress percentages (% delivered, % billed)")
    public ResponseEntity<SalesOrderDto> updateFulfillment(
            @PathVariable UUID id,
            @RequestParam(required = false) BigDecimal perDelivered,
            @RequestParam(required = false) BigDecimal perBilled
    ) {
        return ResponseEntity.ok(salesOrderService.updateFulfillmentProgress(id, perDelivered, perBilled));
    }
}
