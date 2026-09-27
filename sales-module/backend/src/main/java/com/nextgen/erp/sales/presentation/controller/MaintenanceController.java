package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.*;
import com.nextgen.erp.sales.application.service.MaintenanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/maintenance")
@RequiredArgsConstructor
@Tag(name = "Maintenance & Warranty", description = "Endpoints for Annual Maintenance Contracts (AMC), Field Service Visits, and Warranty Claims")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    // ==================== CONTRACTS ====================

    @GetMapping("/contracts")
    @Operation(summary = "Get all maintenance contracts")
    public ResponseEntity<List<MaintenanceContractDto>> getAllContracts() {
        return ResponseEntity.ok(maintenanceService.getAllContracts());
    }

    @GetMapping("/contracts/{id}")
    @Operation(summary = "Get maintenance contract by UUID")
    public ResponseEntity<MaintenanceContractDto> getContractById(@PathVariable UUID id) {
        return ResponseEntity.ok(maintenanceService.getContractById(id));
    }

    @GetMapping("/contracts/by-customer/{customerId}")
    @Operation(summary = "Get maintenance contracts by customer")
    public ResponseEntity<List<MaintenanceContractDto>> getContractsByCustomer(@PathVariable UUID customerId) {
        return ResponseEntity.ok(maintenanceService.getContractsByCustomer(customerId));
    }

    @PostMapping("/contracts")
    @Operation(summary = "Create a maintenance contract")
    public ResponseEntity<MaintenanceContractDto> createContract(@Valid @RequestBody MaintenanceContractCreateRequest request) {
        MaintenanceContractDto created = maintenanceService.createContract(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/contracts/{id}/activate")
    @Operation(summary = "Activate maintenance contract")
    public ResponseEntity<MaintenanceContractDto> activateContract(@PathVariable UUID id) {
        return ResponseEntity.ok(maintenanceService.activateContract(id));
    }

    @PostMapping("/contracts/{id}/cancel")
    @Operation(summary = "Cancel maintenance contract")
    public ResponseEntity<MaintenanceContractDto> cancelContract(@PathVariable UUID id) {
        return ResponseEntity.ok(maintenanceService.cancelContract(id));
    }

    // ==================== VISITS ====================

    @GetMapping("/visits")
    @Operation(summary = "Get all maintenance visits")
    public ResponseEntity<List<MaintenanceVisitDto>> getAllVisits() {
        return ResponseEntity.ok(maintenanceService.getAllVisits());
    }

    @GetMapping("/visits/{id}")
    @Operation(summary = "Get maintenance visit by UUID")
    public ResponseEntity<MaintenanceVisitDto> getVisitById(@PathVariable UUID id) {
        return ResponseEntity.ok(maintenanceService.getVisitById(id));
    }

    @GetMapping("/visits/by-customer/{customerId}")
    @Operation(summary = "Get maintenance visits by customer")
    public ResponseEntity<List<MaintenanceVisitDto>> getVisitsByCustomer(@PathVariable UUID customerId) {
        return ResponseEntity.ok(maintenanceService.getVisitsByCustomer(customerId));
    }

    @GetMapping("/visits/by-contract/{contractId}")
    @Operation(summary = "Get maintenance visits for a specific contract")
    public ResponseEntity<List<MaintenanceVisitDto>> getVisitsByContract(@PathVariable UUID contractId) {
        return ResponseEntity.ok(maintenanceService.getVisitsByContract(contractId));
    }

    @PostMapping("/visits")
    @Operation(summary = "Schedule a maintenance visit")
    public ResponseEntity<MaintenanceVisitDto> createVisit(@Valid @RequestBody MaintenanceVisitCreateRequest request) {
        MaintenanceVisitDto created = maintenanceService.createVisit(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/visits/{id}/start")
    @Operation(summary = "Start maintenance visit")
    public ResponseEntity<MaintenanceVisitDto> startVisit(@PathVariable UUID id) {
        return ResponseEntity.ok(maintenanceService.startVisit(id));
    }

    @PostMapping("/visits/{id}/complete")
    @Operation(summary = "Complete maintenance visit with customer feedback and service notes")
    public ResponseEntity<MaintenanceVisitDto> completeVisit(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String feedback = body != null ? body.get("feedback") : null;
        String notes = body != null ? body.get("notes") : null;
        return ResponseEntity.ok(maintenanceService.completeVisit(id, feedback, notes));
    }

    @PostMapping("/visits/{id}/cancel")
    @Operation(summary = "Cancel maintenance visit")
    public ResponseEntity<MaintenanceVisitDto> cancelVisit(@PathVariable UUID id) {
        return ResponseEntity.ok(maintenanceService.cancelVisit(id));
    }

    // ==================== WARRANTY CLAIMS ====================

    @GetMapping("/claims")
    @Operation(summary = "Get all warranty claims")
    public ResponseEntity<List<WarrantyClaimDto>> getAllClaims() {
        return ResponseEntity.ok(maintenanceService.getAllClaims());
    }

    @GetMapping("/claims/{id}")
    @Operation(summary = "Get warranty claim by UUID")
    public ResponseEntity<WarrantyClaimDto> getClaimById(@PathVariable UUID id) {
        return ResponseEntity.ok(maintenanceService.getClaimById(id));
    }

    @GetMapping("/claims/by-customer/{customerId}")
    @Operation(summary = "Get warranty claims by customer")
    public ResponseEntity<List<WarrantyClaimDto>> getClaimsByCustomer(@PathVariable UUID customerId) {
        return ResponseEntity.ok(maintenanceService.getClaimsByCustomer(customerId));
    }

    @PostMapping("/claims")
    @Operation(summary = "Submit a warranty claim")
    public ResponseEntity<WarrantyClaimDto> createClaim(@Valid @RequestBody WarrantyClaimCreateRequest request) {
        WarrantyClaimDto created = maintenanceService.createClaim(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/claims/{id}/resolve")
    @Operation(summary = "Resolve warranty claim with action taken")
    public ResponseEntity<WarrantyClaimDto> resolveClaim(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String resolutionType = body != null ? body.get("resolutionType") : "REPAIR";
        String notes = body != null ? body.get("notes") : null;
        return ResponseEntity.ok(maintenanceService.resolveClaim(id, resolutionType, notes));
    }

    @PostMapping("/claims/{id}/close")
    @Operation(summary = "Close warranty claim")
    public ResponseEntity<WarrantyClaimDto> closeClaim(@PathVariable UUID id) {
        return ResponseEntity.ok(maintenanceService.closeClaim(id));
    }
}
