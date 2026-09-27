package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.DeliveryNoteCreateRequest;
import com.nextgen.erp.sales.application.dto.DeliveryNoteDto;
import com.nextgen.erp.sales.application.service.DeliveryNoteService;
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
@RequestMapping("/api/v1/delivery-notes")
@RequiredArgsConstructor
@Tag(name = "Fulfilment & Delivery Notes", description = "Endpoints for dispatching shipments and updating order delivery status")
public class DeliveryNoteController {

    private final DeliveryNoteService deliveryNoteService;

    @GetMapping
    @Operation(summary = "Get all delivery notes")
    public ResponseEntity<List<DeliveryNoteDto>> getAllDeliveryNotes() {
        return ResponseEntity.ok(deliveryNoteService.getAllDeliveryNotes());
    }

    @GetMapping("/returns")
    @Operation(summary = "Get all Return Delivery Notes (Sales Returns)")
    public ResponseEntity<List<DeliveryNoteDto>> getAllReturns() {
        return ResponseEntity.ok(deliveryNoteService.getAllReturns());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get delivery note by ID")
    public ResponseEntity<DeliveryNoteDto> getDeliveryNoteById(@PathVariable UUID id) {
        return ResponseEntity.ok(deliveryNoteService.getDeliveryNoteById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new delivery note")
    public ResponseEntity<DeliveryNoteDto> createDeliveryNote(@Valid @RequestBody DeliveryNoteCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deliveryNoteService.createDeliveryNote(request));
    }

    @PostMapping("/from-order/{salesOrderId}")
    @Operation(summary = "Generate delivery note from an existing Sales Order")
    public ResponseEntity<DeliveryNoteDto> makeFromSalesOrder(@PathVariable UUID salesOrderId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deliveryNoteService.makeFromSalesOrder(salesOrderId));
    }

    @PostMapping("/{id}/create-return")
    @Operation(summary = "Generate Return Delivery Note (Sales Return) against an existing Delivery Note")
    public ResponseEntity<DeliveryNoteDto> createDeliveryReturn(
            @PathVariable UUID id,
            @RequestBody(required = false) DeliveryNoteCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deliveryNoteService.createDeliveryReturn(id, request));
    }
}
