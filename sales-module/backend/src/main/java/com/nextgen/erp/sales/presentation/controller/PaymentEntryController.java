package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.PaymentEntryCreateRequest;
import com.nextgen.erp.sales.application.dto.PaymentEntryDto;
import com.nextgen.erp.sales.application.service.PaymentEntryService;
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
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Receipts & AR", description = "Endpoints for customer payments, invoice allocations, and advance tracking")
public class PaymentEntryController {

    private final PaymentEntryService paymentEntryService;

    @GetMapping
    @Operation(summary = "Get all payment entries")
    public ResponseEntity<List<PaymentEntryDto>> getAllPayments() {
        return ResponseEntity.ok(paymentEntryService.getAllPayments());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment entry by ID")
    public ResponseEntity<PaymentEntryDto> getPaymentById(@PathVariable UUID id) {
        return ResponseEntity.ok(paymentEntryService.getPaymentById(id));
    }

    @PostMapping
    @Operation(summary = "Record customer payment / receipt")
    public ResponseEntity<PaymentEntryDto> recordPayment(@Valid @RequestBody PaymentEntryCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentEntryService.recordPayment(request));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel customer payment and post contra GL reversal")
    public ResponseEntity<PaymentEntryDto> cancelPayment(@PathVariable UUID id) {
        return ResponseEntity.ok(paymentEntryService.cancelPaymentEntry(id));
    }
}
