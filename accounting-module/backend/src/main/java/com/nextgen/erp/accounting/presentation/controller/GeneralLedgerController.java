package com.nextgen.erp.accounting.presentation.controller;

import com.nextgen.erp.accounting.domain.model.GeneralLedgerEntry;
import com.nextgen.erp.accounting.infrastructure.repository.GeneralLedgerEntryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/gl")
@RequiredArgsConstructor
@Tag(name = "General Ledger (GL)", description = "Endpoints for immutable double-entry ledger audit logs")
public class GeneralLedgerController {

    private final GeneralLedgerEntryRepository glEntryRepository;
    private final com.nextgen.erp.accounting.application.service.PerpetualStockGlService perpetualStockGlService;

    @GetMapping
    @Operation(summary = "Get all General Ledger entries")
    public ResponseEntity<List<GeneralLedgerEntry>> getAllEntries(
            @RequestParam(required = false) UUID accountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        if (accountId != null) {
            return ResponseEntity.ok(glEntryRepository.findByAccountIdOrderByPostingDateAscCreatedAtAsc(accountId));
        }
        if (fromDate != null && toDate != null) {
            return ResponseEntity.ok(glEntryRepository.findByPostingDateBetweenOrderByPostingDateAsc(fromDate, toDate));
        }
        return ResponseEntity.ok(glEntryRepository.findAllByOrderByPostingDateDescCreatedAtDesc());
    }

    @PostMapping("/perpetual-stock")
    @Operation(summary = "Post automated double-entry GL ledger transactions for perpetual inventory movements")
    public ResponseEntity<List<GeneralLedgerEntry>> postPerpetualStockGl(
            @RequestBody com.nextgen.erp.accounting.domain.model.PerpetualStockGlRequest request) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(perpetualStockGlService.postPerpetualStockGl(request));
    }
}
