package com.nextgen.erp.sales.presentation.controller;

import com.nextgen.erp.sales.application.dto.*;
import com.nextgen.erp.sales.application.service.PaymentTermsService;
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
@RequestMapping("/api/v1/payment-terms")
@RequiredArgsConstructor
@Tag(name = "Payment Terms & Milestone Schedules", description = "Endpoints for configuring payment terms templates, generating milestone installment schedules, and partial milestone invoicing")
public class PaymentTermsController {

    private final PaymentTermsService paymentTermsService;

    @GetMapping("/templates")
    @Operation(summary = "Get all payment terms templates with installment milestone items")
    public ResponseEntity<List<PaymentTermsTemplateDto>> getAllTemplates() {
        return ResponseEntity.ok(paymentTermsService.getAllTemplates());
    }

    @GetMapping("/templates/{id}")
    @Operation(summary = "Get payment terms template by UUID")
    public ResponseEntity<PaymentTermsTemplateDto> getTemplateById(@PathVariable UUID id) {
        return ResponseEntity.ok(paymentTermsService.getTemplateById(id));
    }

    @PostMapping("/templates")
    @Operation(summary = "Create a custom payment terms template with milestone breakdown")
    public ResponseEntity<PaymentTermsTemplateDto> createTemplate(@Valid @RequestBody PaymentTermsTemplateCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentTermsService.createTemplate(request));
    }

    @GetMapping("/schedules/{voucherType}/{voucherId}")
    @Operation(summary = "Get payment schedule milestones for a voucher (e.g. SALES_ORDER, QUOTATION)")
    public ResponseEntity<List<PaymentScheduleDto>> getScheduleForVoucher(
            @PathVariable String voucherType,
            @PathVariable UUID voucherId) {
        return ResponseEntity.ok(paymentTermsService.getScheduleForVoucher(voucherType, voucherId));
    }

    @PostMapping("/schedules/generate/sales-order/{salesOrderId}")
    @Operation(summary = "Generate or refresh payment schedule milestones for a Sales Order based on its Payment Terms Template")
    public ResponseEntity<List<PaymentScheduleDto>> generateScheduleForOrder(@PathVariable UUID salesOrderId) {
        return ResponseEntity.ok(paymentTermsService.generateScheduleForOrder(salesOrderId));
    }

    @PostMapping("/schedules/{salesOrderId}/milestone/{scheduleId}/invoice")
    @Operation(summary = "Invoice an individual milestone from the payment schedule (partial billing)")
    public ResponseEntity<SalesInvoiceDto> invoiceMilestone(
            @PathVariable UUID salesOrderId,
            @PathVariable UUID scheduleId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentTermsService.invoiceMilestone(salesOrderId, scheduleId));
    }
}
