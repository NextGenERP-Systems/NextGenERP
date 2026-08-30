package com.nextgen.erp.accounting.presentation.controller;

import com.nextgen.erp.accounting.application.service.JournalEntryService;
import com.nextgen.erp.accounting.domain.model.JournalEntry;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/journal-entries")
@RequiredArgsConstructor
@Tag(name = "Journal Entries", description = "Endpoints for multi-line double-entry journal vouchers")
public class JournalEntryController {

    private final JournalEntryService journalEntryService;

    @GetMapping
    @Operation(summary = "Get all journal entries")
    public ResponseEntity<List<JournalEntry>> getAllJournalEntries() {
        return ResponseEntity.ok(journalEntryService.getAllJournalEntries());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get journal entry by UUID")
    public ResponseEntity<JournalEntry> getJournalEntryById(@PathVariable UUID id) {
        return journalEntryService.getJournalEntryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Post a new double-entry journal voucher")
    public ResponseEntity<JournalEntry> createJournalEntry(@RequestBody JournalEntry journalEntry) {
        return ResponseEntity.status(HttpStatus.CREATED).body(journalEntryService.createJournalEntry(journalEntry));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Journal Entry by UUID")
    public ResponseEntity<Void> deleteJournalEntry(@PathVariable UUID id) {
        journalEntryService.deleteJournalEntry(id);
        return ResponseEntity.noContent().build();
    }
}
