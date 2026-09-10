package com.nextgen.erp.accounting.presentation.controller;

import com.nextgen.erp.accounting.application.service.PaymentEntryService;
import com.nextgen.erp.accounting.domain.model.PaymentEntry;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payment-entries")
@RequiredArgsConstructor
@Tag(name = "Payment Entries", description = "Endpoints for multi-mode payment receipts, supplier disbursements, and bank transfers")
public class PaymentEntryController {

    private final PaymentEntryService paymentEntryService;

    @GetMapping
    @Operation(summary = "Get all Payment Entries")
    public ResponseEntity<List<PaymentEntry>> getAllPaymentEntries() {
        return ResponseEntity.ok(paymentEntryService.getAllPaymentEntries());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Payment Entry by UUID")
    public ResponseEntity<PaymentEntry> getPaymentEntryById(@PathVariable UUID id) {
        return paymentEntryService.getPaymentEntryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create and record a Payment Entry")
    public ResponseEntity<PaymentEntry> createPaymentEntry(@RequestBody PaymentEntry entry) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentEntryService.createPaymentEntry(entry));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Payment Entry by UUID")
    public ResponseEntity<Void> deletePaymentEntry(@PathVariable UUID id) {
        paymentEntryService.deletePaymentEntry(id);
        return ResponseEntity.noContent().build();
    }
}
