package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.*;
import com.nextgen.erp.sales.application.service.LeadOpportunityService;
import com.nextgen.erp.sales.domain.model.LeadStatus;
import com.nextgen.erp.sales.domain.model.OpportunityStatus;
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
@RequiredArgsConstructor
@Tag(name = "CRM & Pre-Sales", description = "Endpoints for managing Leads, Opportunities, and pipeline stages")
public class LeadOpportunityController {

    private final LeadOpportunityService service;

    // --- LEADS ---

    @GetMapping("/api/v1/leads")
    @Operation(summary = "Get all leads")
    public ResponseEntity<List<LeadDto>> getAllLeads() {
        return ResponseEntity.ok(service.getAllLeads());
    }

    @GetMapping("/api/v1/leads/{id}")
    @Operation(summary = "Get lead by ID")
    public ResponseEntity<LeadDto> getLeadById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getLeadById(id));
    }

    @PostMapping("/api/v1/leads")
    @Operation(summary = "Create a new lead")
    public ResponseEntity<LeadDto> createLead(@Valid @RequestBody LeadCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createLead(request));
    }

    @PatchMapping("/api/v1/leads/{id}/status")
    @Operation(summary = "Update lead status")
    public ResponseEntity<LeadDto> updateLeadStatus(@PathVariable UUID id, @RequestParam LeadStatus status) {
        return ResponseEntity.ok(service.updateLeadStatus(id, status));
    }

    @PostMapping("/api/v1/leads/{id}/convert-to-opportunity")
    @Operation(summary = "Convert Lead to Opportunity")
    public ResponseEntity<OpportunityDto> convertLeadToOpportunity(@PathVariable UUID id) {
        return ResponseEntity.ok(service.convertLeadToOpportunity(id));
    }

    // --- OPPORTUNITIES ---

    @GetMapping("/api/v1/opportunities")
    @Operation(summary = "Get all opportunities")
    public ResponseEntity<List<OpportunityDto>> getAllOpportunities() {
        return ResponseEntity.ok(service.getAllOpportunities());
    }

    @GetMapping("/api/v1/opportunities/{id}")
    @Operation(summary = "Get opportunity by ID")
    public ResponseEntity<OpportunityDto> getOpportunityById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getOpportunityById(id));
    }

    @PostMapping("/api/v1/opportunities")
    @Operation(summary = "Create a new opportunity")
    public ResponseEntity<OpportunityDto> createOpportunity(@Valid @RequestBody OpportunityCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createOpportunity(request));
    }

    @PatchMapping("/api/v1/opportunities/{id}/status")
    @Operation(summary = "Update opportunity status and sales stage")
    public ResponseEntity<OpportunityDto> updateOpportunityStatus(
            @PathVariable UUID id,
            @RequestParam OpportunityStatus status,
            @RequestParam(required = false) String stage) {
        return ResponseEntity.ok(service.updateOpportunityStatus(id, status, stage));
    }

    @PostMapping("/api/v1/opportunities/{id}/convert-to-quotation")
    @Operation(summary = "Convert Opportunity to Quotation")
    public ResponseEntity<QuotationDto> convertOpportunityToQuotation(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID customerId) {
        return ResponseEntity.ok(service.convertOpportunityToQuotation(id, customerId));
    }
}
