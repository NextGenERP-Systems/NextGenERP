package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.BlanketOrderCreateRequest;
import com.nextgen.erp.sales.application.dto.BlanketOrderDto;
import com.nextgen.erp.sales.application.service.BlanketOrderService;
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
@RequestMapping("/api/v1/blanket-orders")
@RequiredArgsConstructor
@Tag(name = "Blanket Order Management", description = "Endpoints for managing long-term recurring customer agreements and blanket purchase quantities")
public class BlanketOrderController {

    private final BlanketOrderService blanketOrderService;

    @GetMapping
    @Operation(summary = "Get all blanket orders")
    public ResponseEntity<List<BlanketOrderDto>> getAllBlanketOrders() {
        return ResponseEntity.ok(blanketOrderService.getAllBlanketOrders());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get blanket order by UUID with items and consumed quantities")
    public ResponseEntity<BlanketOrderDto> getBlanketOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(blanketOrderService.getBlanketOrderById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new blanket order agreement")
    public ResponseEntity<BlanketOrderDto> createBlanketOrder(@Valid @RequestBody BlanketOrderCreateRequest request) {
        BlanketOrderDto created = blanketOrderService.createBlanketOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/close")
    @Operation(summary = "Close a blanket order agreement")
    public ResponseEntity<BlanketOrderDto> closeBlanketOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(blanketOrderService.closeBlanketOrder(id));
    }
}
