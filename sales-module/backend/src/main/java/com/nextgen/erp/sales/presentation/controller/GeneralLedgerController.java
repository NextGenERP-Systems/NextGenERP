package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.service.GeneralLedgerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "General Ledger & Accounting", description = "Double-entry GL audit trail, customer ledgers, and trial balance")
public class GeneralLedgerController {

    private final GeneralLedgerService glService;

    @GetMapping("/api/v1/accounts/gl-entries")
    @Operation(summary = "Get all double-entry General Ledger (GL) entries")
    public ResponseEntity<List<GeneralLedgerService.GlEntryDto>> getAllGlEntries() {
        return ResponseEntity.ok(glService.getAllGlEntries());
    }

    @GetMapping("/api/v1/accounts/customer-ledger/{customerId}")
    @Operation(summary = "Get customer ledger statements")
    public ResponseEntity<List<GeneralLedgerService.GlEntryDto>> getCustomerLedger(@PathVariable UUID customerId) {
        return ResponseEntity.ok(glService.getCustomerLedger(customerId));
    }
}
