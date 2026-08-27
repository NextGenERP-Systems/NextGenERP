package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.QuotationCreateRequest;
import com.nextgen.erp.sales.application.dto.QuotationDto;
import com.nextgen.erp.sales.application.service.QuotationService;
import com.nextgen.erp.sales.domain.model.QuotationStatus;
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
@RequestMapping("/api/v1/quotations")
@RequiredArgsConstructor
@Tag(name = "Quotation Engine", description = "Endpoints for creating and managing Quotations, Taxes, and Conversions")
public class QuotationController {

    private final QuotationService quotationService;

    @GetMapping
    @Operation(summary = "List all quotations")
    public ResponseEntity<List<QuotationDto>> getAllQuotations() {
        return ResponseEntity.ok(quotationService.getAllQuotations());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get quotation by UUID")
    public ResponseEntity<QuotationDto> getQuotationById(@PathVariable UUID id) {
        return ResponseEntity.ok(quotationService.getQuotationById(id));
    }

    @PostMapping
    @Operation(summary = "Create and calculate a new quotation with multi-tier taxes & pricing rules")
    public ResponseEntity<QuotationDto> createQuotation(@Valid @RequestBody QuotationCreateRequest request) {
        QuotationDto created = quotationService.createQuotation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update status of quotation (e.g., REPLIED, LOST, CANCELLED)")
    public ResponseEntity<QuotationDto> updateStatus(@PathVariable UUID id, @RequestParam QuotationStatus status) {
        return ResponseEntity.ok(quotationService.updateQuotationStatus(id, status));
    }

    @PostMapping("/{id}/lost")
    @Operation(summary = "Mark quotation as lost with competitor and reason")
    public ResponseEntity<QuotationDto> markLost(
            @PathVariable UUID id,
            @RequestParam com.nextgen.erp.sales.domain.model.QuotationLostReason reason,
            @RequestParam(required = false) String competitorName) {
        return ResponseEntity.ok(quotationService.markQuotationLost(id, reason, competitorName));
    }
}
