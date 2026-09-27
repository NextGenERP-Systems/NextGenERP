package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.PackingSlipCreateRequest;
import com.nextgen.erp.sales.application.dto.PackingSlipDto;
import com.nextgen.erp.sales.application.service.PackingSlipService;
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
@RequestMapping("/api/v1/packing-slips")
@RequiredArgsConstructor
@Tag(name = "Packing Slip Management", description = "Endpoints for warehouse packaging, carton numbering, gross/net weight calculation, and shipment dispatch")
public class PackingSlipController {

    private final PackingSlipService packingSlipService;

    @GetMapping
    @Operation(summary = "Get all packing slips")
    public ResponseEntity<List<PackingSlipDto>> getAllPackingSlips() {
        return ResponseEntity.ok(packingSlipService.getAllPackingSlips());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get packing slip by UUID with items and weight breakdown")
    public ResponseEntity<PackingSlipDto> getPackingSlipById(@PathVariable UUID id) {
        return ResponseEntity.ok(packingSlipService.getPackingSlipById(id));
    }

    @GetMapping("/delivery-note/{deliveryNoteId}")
    @Operation(summary = "Get all packing slips created against a Delivery Note")
    public ResponseEntity<List<PackingSlipDto>> getPackingSlipsByDeliveryNote(@PathVariable UUID deliveryNoteId) {
        return ResponseEntity.ok(packingSlipService.getPackingSlipsByDeliveryNote(deliveryNoteId));
    }

    @PostMapping
    @Operation(summary = "Create a new packing slip with package numbering and item weights")
    public ResponseEntity<PackingSlipDto> createPackingSlip(@Valid @RequestBody PackingSlipCreateRequest request) {
        PackingSlipDto created = packingSlipService.createPackingSlip(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/ship")
    @Operation(summary = "Mark packing slip as shipped for dispatch")
    public ResponseEntity<PackingSlipDto> markPackingSlipShipped(@PathVariable UUID id) {
        return ResponseEntity.ok(packingSlipService.markPackingSlipShipped(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an unshipped draft packing slip")
    public ResponseEntity<Void> deletePackingSlip(@PathVariable UUID id) {
        packingSlipService.deletePackingSlip(id);
        return ResponseEntity.noContent().build();
    }
}
