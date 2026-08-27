package com.nextgen.erp.sales.application.service;

import com.nextgen.erp.sales.domain.model.*;
import com.nextgen.erp.sales.infrastructure.repository.GlEntryRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeneralLedgerService {

    private final GlEntryRepository glEntryRepository;

    public static final String ACC_DEBTORS = "1310 - Debtors (Accounts Receivable)";
    public static final String ACC_SALES_REVENUE = "4110 - Sales Revenue";
    public static final String ACC_TAX_PAYABLE = "2210 - Sales Output Tax Liability";
    public static final String ACC_BANK = "1110 - HDFC Bank Operational Current A/C";
    public static final String ACC_CASH = "1120 - Petty Cash Account";

    @Transactional
    public List<GlEntry> postSalesInvoiceGl(SalesInvoice invoice) {
        log.info("Posting double-entry GL for Sales Invoice: {}", invoice.getInvoiceNumber());
        List<GlEntry> entries = new ArrayList<>();

        // 1. DEBIT: Debtors (Accounts Receivable) for Grand Total
        entries.add(GlEntry.builder()
                .postingDate(invoice.getPostingDate() != null ? invoice.getPostingDate() : LocalDate.now())
                .voucherType("Sales Invoice")
                .voucherNo(invoice.getInvoiceNumber())
                .voucherId(invoice.getId())
                .account(ACC_DEBTORS)
                .debit(invoice.getGrandTotal())
                .credit(BigDecimal.ZERO)
                .customer(invoice.getCustomer())
                .remarks("Sales Invoice created for " + invoice.getCustomerName())
                .build());

        // 2. CREDIT: Sales Revenue for Net Total
        entries.add(GlEntry.builder()
                .postingDate(invoice.getPostingDate() != null ? invoice.getPostingDate() : LocalDate.now())
                .voucherType("Sales Invoice")
                .voucherNo(invoice.getInvoiceNumber())
                .voucherId(invoice.getId())
                .account(ACC_SALES_REVENUE)
                .debit(BigDecimal.ZERO)
                .credit(invoice.getNetTotal())
                .customer(invoice.getCustomer())
                .remarks("Sales Revenue earned on " + invoice.getInvoiceNumber())
                .build());

        // 3. CREDIT: Tax Liability for Tax Amount (if > 0)
        if (invoice.getTotalTax() != null && invoice.getTotalTax().compareTo(BigDecimal.ZERO) > 0) {
            entries.add(GlEntry.builder()
                    .postingDate(invoice.getPostingDate() != null ? invoice.getPostingDate() : LocalDate.now())
                    .voucherType("Sales Invoice")
                    .voucherNo(invoice.getInvoiceNumber())
                    .voucherId(invoice.getId())
                    .account(ACC_TAX_PAYABLE)
                    .debit(BigDecimal.ZERO)
                    .credit(invoice.getTotalTax())
                    .customer(invoice.getCustomer())
                    .remarks("GST / Sales Tax payable on " + invoice.getInvoiceNumber())
                    .build());
        }

        return glEntryRepository.saveAll(entries);
    }

    @Transactional
    public List<GlEntry> postPaymentEntryGl(PaymentEntry payment) {
        log.info("Posting double-entry GL for Payment Receipt: {}", payment.getPaymentNumber());
        List<GlEntry> entries = new ArrayList<>();

        String bankOrCashAccount = payment.getPaymentMode() == PaymentMode.CASH ? ACC_CASH : ACC_BANK;

        // 1. DEBIT: Bank / Cash Account (Inflow)
        entries.add(GlEntry.builder()
                .postingDate(payment.getPostingDate() != null ? payment.getPostingDate() : LocalDate.now())
                .voucherType("Payment Entry")
                .voucherNo(payment.getPaymentNumber())
                .voucherId(payment.getId())
                .account(bankOrCashAccount)
                .debit(payment.getPaidAmount())
                .credit(BigDecimal.ZERO)
                .customer(payment.getCustomer())
                .remarks("Customer Receipt via " + payment.getPaymentMode() + (payment.getReferenceNo() != null ? " Ref: " + payment.getReferenceNo() : ""))
                .build());

        // 2. CREDIT: Debtors (Accounts Receivable) (Outflow reduction)
        entries.add(GlEntry.builder()
                .postingDate(payment.getPostingDate() != null ? payment.getPostingDate() : LocalDate.now())
                .voucherType("Payment Entry")
                .voucherNo(payment.getPaymentNumber())
                .voucherId(payment.getId())
                .account(ACC_DEBTORS)
                .debit(BigDecimal.ZERO)
                .credit(payment.getPaidAmount())
                .customer(payment.getCustomer())
                .remarks("AR Settlement from " + (payment.getCustomer() != null ? payment.getCustomer().getCustomerName() : "Customer"))
                .build());

        return glEntryRepository.saveAll(entries);
    }

    @Transactional
    public List<GlEntry> reverseSalesInvoiceGl(SalesInvoice invoice) {
        log.info("Posting reversal GL entries for Cancelled Sales Invoice: {}", invoice.getInvoiceNumber());
        
        // 1. Mark existing entries as cancelled
        List<GlEntry> existingEntries = glEntryRepository.findByVoucherTypeAndVoucherId("Sales Invoice", invoice.getId());
        for (GlEntry e : existingEntries) {
            e.setCancelled(true);
        }
        glEntryRepository.saveAll(existingEntries);

        // 2. Post Contra Reversal Entries
        List<GlEntry> contraEntries = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // DEBIT: Sales Revenue (Contra)
        contraEntries.add(GlEntry.builder()
                .postingDate(today)
                .voucherType("Sales Invoice Reversal")
                .voucherNo(invoice.getInvoiceNumber())
                .voucherId(invoice.getId())
                .account(ACC_SALES_REVENUE)
                .debit(invoice.getNetTotal())
                .credit(BigDecimal.ZERO)
                .customer(invoice.getCustomer())
                .remarks("Reversal of Sales Revenue on Cancelled Invoice: " + invoice.getInvoiceNumber())
                .cancelled(false)
                .build());

        // DEBIT: Tax Liability (Contra)
        if (invoice.getTotalTax() != null && invoice.getTotalTax().compareTo(BigDecimal.ZERO) > 0) {
            contraEntries.add(GlEntry.builder()
                    .postingDate(today)
                    .voucherType("Sales Invoice Reversal")
                    .voucherNo(invoice.getInvoiceNumber())
                    .voucherId(invoice.getId())
                    .account(ACC_TAX_PAYABLE)
                    .debit(invoice.getTotalTax())
                    .credit(BigDecimal.ZERO)
                    .customer(invoice.getCustomer())
                    .remarks("Reversal of Output Tax on Cancelled Invoice: " + invoice.getInvoiceNumber())
                    .cancelled(false)
                    .build());
        }

        // CREDIT: Debtors (Contra)
        contraEntries.add(GlEntry.builder()
                .postingDate(today)
                .voucherType("Sales Invoice Reversal")
                .voucherNo(invoice.getInvoiceNumber())
                .voucherId(invoice.getId())
                .account(ACC_DEBTORS)
                .debit(BigDecimal.ZERO)
                .credit(invoice.getGrandTotal())
                .customer(invoice.getCustomer())
                .remarks("Reversal of Debtors receivable on Cancelled Invoice: " + invoice.getInvoiceNumber())
                .cancelled(false)
                .build());

        return glEntryRepository.saveAll(contraEntries);
    }

    @Transactional
    public List<GlEntry> reversePaymentEntryGl(PaymentEntry payment) {
        log.info("Posting reversal GL entries for Cancelled Payment Entry: {}", payment.getPaymentNumber());

        // 1. Mark existing entries as cancelled
        List<GlEntry> existingEntries = glEntryRepository.findByVoucherTypeAndVoucherId("Payment Entry", payment.getId());
        for (GlEntry e : existingEntries) {
            e.setCancelled(true);
        }
        glEntryRepository.saveAll(existingEntries);

        // 2. Post Contra Reversal Entries
        List<GlEntry> contraEntries = new ArrayList<>();
        LocalDate today = LocalDate.now();
        String bankOrCashAccount = payment.getPaymentMode() == PaymentMode.CASH ? ACC_CASH : ACC_BANK;

        // DEBIT: Debtors (Restore receivable)
        contraEntries.add(GlEntry.builder()
                .postingDate(today)
                .voucherType("Payment Entry Reversal")
                .voucherNo(payment.getPaymentNumber())
                .voucherId(payment.getId())
                .account(ACC_DEBTORS)
                .debit(payment.getPaidAmount())
                .credit(BigDecimal.ZERO)
                .customer(payment.getCustomer())
                .remarks("Reversal of Customer AR Payment Settlement: " + payment.getPaymentNumber())
                .cancelled(false)
                .build());

        // CREDIT: Bank / Cash (Inflow reversal)
        contraEntries.add(GlEntry.builder()
                .postingDate(today)
                .voucherType("Payment Entry Reversal")
                .voucherNo(payment.getPaymentNumber())
                .voucherId(payment.getId())
                .account(bankOrCashAccount)
                .debit(BigDecimal.ZERO)
                .credit(payment.getPaidAmount())
                .customer(payment.getCustomer())
                .remarks("Reversal of Bank/Cash receipt on Cancelled Payment: " + payment.getPaymentNumber())
                .cancelled(false)
                .build());

        return glEntryRepository.saveAll(contraEntries);
    }

    @Transactional(readOnly = true)
    public List<GlEntryDto> getAllGlEntries() {
        return glEntryRepository.findAllByOrderByPostingDateDescCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GlEntryDto> getCustomerLedger(UUID customerId) {
        return glEntryRepository.findByCustomerIdOrderByPostingDateDesc(customerId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private GlEntryDto toDto(GlEntry entry) {
        return GlEntryDto.builder()
                .id(entry.getId())
                .postingDate(entry.getPostingDate() != null ? entry.getPostingDate().toString() : null)
                .voucherType(entry.getVoucherType())
                .voucherNo(entry.getVoucherNo())
                .voucherId(entry.getVoucherId())
                .account(entry.getAccount())
                .debit(entry.getDebit())
                .credit(entry.getCredit())
                .customerId(entry.getCustomer() != null ? entry.getCustomer().getId() : null)
                .customerName(entry.getCustomer() != null ? entry.getCustomer().getCustomerName() : null)
                .remarks(entry.getRemarks())
                .cancelled(entry.isCancelled())
                .createdAt(entry.getCreatedAt() != null ? entry.getCreatedAt().toString() : null)
                .build();
    }

    @Data
    @Builder
    public static class GlEntryDto {
        private UUID id;
        private String postingDate;
        private String voucherType;
        private String voucherNo;
        private UUID voucherId;
        private String account;
        private BigDecimal debit;
        private BigDecimal credit;
        private UUID customerId;
        private String customerName;
        private String remarks;
        private boolean cancelled;
        private String createdAt;
    }
}
