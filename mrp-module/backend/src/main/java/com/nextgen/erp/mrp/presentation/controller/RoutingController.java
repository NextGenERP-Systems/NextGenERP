package com.nextgen.erp.mrp.presentation.controller;

import com.nextgen.erp.mrp.application.service.RoutingService;
import com.nextgen.erp.mrp.domain.entity.Operation;
import com.nextgen.erp.mrp.domain.entity.Routing;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mrp")
@RequiredArgsConstructor
@Tag(name = "Routing & Operations", description = "Workstation Operations & Process Sequences")
public class RoutingController {

    private final RoutingService routingService;

    @GetMapping("/operations")
    @io.swagger.v3.oas.annotations.Operation(summary = "Get list of all standard Operations")
    public ResponseEntity<List<Operation>> getAllOperations() {
        return ResponseEntity.ok(routingService.getAllOperations());
    }

    @PostMapping("/operations")
    @io.swagger.v3.oas.annotations.Operation(summary = "Create a new standard Operation")
    public ResponseEntity<Operation> createOperation(@RequestBody Operation op) {
        return ResponseEntity.ok(routingService.createOperation(op));
    }

    @GetMapping("/routings")
    @io.swagger.v3.oas.annotations.Operation(summary = "Get list of all Routings")
    public ResponseEntity<List<Routing>> getAllRoutings() {
        return ResponseEntity.ok(routingService.getAllRoutings());
    }

    @GetMapping("/routings/{routingId}")
    @io.swagger.v3.oas.annotations.Operation(summary = "Get Routing details by ID")
    public ResponseEntity<Routing> getRoutingById(@PathVariable String routingId) {
        return ResponseEntity.ok(routingService.getRoutingById(routingId));
    }

    @PostMapping("/routings")
    @io.swagger.v3.oas.annotations.Operation(summary = "Create a new Routing sequence")
    public ResponseEntity<Routing> createRouting(@RequestBody Routing routing) {
        return ResponseEntity.ok(routingService.createRouting(routing));
    }
}

