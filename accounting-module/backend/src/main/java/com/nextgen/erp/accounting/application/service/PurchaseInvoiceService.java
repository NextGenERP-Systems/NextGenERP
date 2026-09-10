package com.nextgen.erp.accounting.application.service;

import com.nextgen.erp.accounting.domain.engine.GeneralLedgerPoster;
import com.nextgen.erp.accounting.domain.model.Account;
import com.nextgen.erp.accounting.domain.model.Enums.InvoiceStatus;
import com.nextgen.erp.accounting.domain.model.Enums.PartyType;
import com.nextgen.erp.accounting.domain.model.Enums.VoucherType;
import com.nextgen.erp.accounting.domain.model.GeneralLedgerEntry;
import com.nextgen.erp.accounting.domain.model.PurchaseInvoice;
import com.nextgen.erp.accounting.domain.model.PurchaseInvoiceItem;
import com.nextgen.erp.accounting.infrastructure.repository.AccountRepository;
import com.nextgen.erp.accounting.infrastructure.repository.PurchaseInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseInvoiceService {

    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final AccountRepository accountRepository;
    private final GeneralLedgerPoster glPoster;

    @Transactional(readOnly = true)
    public List<PurchaseInvoice> getAllPurchaseInvoices() {
        return purchaseInvoiceRepository.findAllByOrderByPostingDateDesc();
    }

    @Transactional(readOnly = true)
    public Optional<PurchaseInvoice> getPurchaseInvoiceById(UUID id) {
        return purchaseInvoiceRepository.findById(id);
    }

    @Transactional
    public PurchaseInvoice createPurchaseInvoice(PurchaseInvoice invoice) {
        if (invoice.getBillNumber() == null || invoice.getBillNumber().isBlank()) {
            long count = purchaseInvoiceRepository.count() + 1;
            invoice.setBillNumber(String.format("PINV-%d-%04d", LocalDate.now().getYear(), count));
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        if (invoice.getItems() != null) {
            for (PurchaseInvoiceItem item : invoice.getItems()) {
                item.setPurchaseInvoice(invoice);
                BigDecimal qty = item.getQuantity() != null ? item.getQuantity() : BigDecimal.ONE;
                BigDecimal rate = item.getRate() != null ? item.getRate() : BigDecimal.ZERO;
                BigDecimal amount = qty.multiply(rate).setScale(2, RoundingMode.HALF_UP);
                item.setAmount(amount);
                subtotal = subtotal.add(amount);
            }
        }

        BigDecimal totalTax = invoice.getTotalTax() != null ? invoice.getTotalTax() : BigDecimal.ZERO;
        BigDecimal grandTotal = subtotal.add(totalTax);

        invoice.setSubtotal(subtotal);
        invoice.setGrandTotal(grandTotal);
        invoice.setOutstandingAmount(grandTotal);
        invoice.setStatus(InvoiceStatus.SUBMITTED);

        PurchaseInvoice saved = purchaseInvoiceRepository.save(invoice);

        // Auto-Post GL Entries for Accounts Payable
        Account creditorAccount = accountRepository.findByAccountCode("2110")
                .orElseGet(() -> accountRepository.findAll().stream()
                        .filter(a -> "Payable".equalsIgnoreCase(a.getAccountType()))
                        .findFirst()
                        .orElse(null));

        Account expenseAccount = accountRepository.findByAccountCode("5300")
                .orElseGet(() -> accountRepository.findAll().stream()
                        .filter(a -> "Operating Expense".equalsIgnoreCase(a.getAccountType()) || "Cost of Goods Sold".equalsIgnoreCase(a.getAccountType()))
                        .findFirst()
                        .orElse(null));

        if (creditorAccount != null && expenseAccount != null) {
            List<GeneralLedgerEntry> glEntries = new ArrayList<>();

            // 1. Debit Expense Account (Subtotal)
            glEntries.add(GeneralLedgerEntry.builder()
                    .postingDate(saved.getPostingDate())
                    .account(expenseAccount)
                    .voucherType(VoucherType.PURCHASE_INVOICE)
                    .voucherNumber(saved.getBillNumber())
                    .voucherId(saved.getId())
                    .debit(subtotal)
                    .credit(BigDecimal.ZERO)
                    .againstAccount(creditorAccount.getAccountName())
                    .partyType(PartyType.SUPPLIER)
                    .partyName(saved.getSupplierName())
                    .remarks("Purchase Expense from " + saved.getSupplierName())
                    .build());

            // 2. Credit Accounts Payable (Grand Total)
            glEntries.add(GeneralLedgerEntry.builder()
                    .postingDate(saved.getPostingDate())
                    .account(creditorAccount)
                    .voucherType(VoucherType.PURCHASE_INVOICE)
                    .voucherNumber(saved.getBillNumber())
                    .voucherId(saved.getId())
                    .debit(BigDecimal.ZERO)
                    .credit(grandTotal)
                    .againstAccount(expenseAccount.getAccountName())
                    .partyType(PartyType.SUPPLIER)
                    .partyName(saved.getSupplierName())
                    .remarks("Vendor Bill Payable to " + saved.getSupplierName())
                    .build());

            glPoster.post(glEntries);
        }

        return saved;
    }

    @Transactional
    public void deletePurchaseInvoice(UUID id) {
        purchaseInvoiceRepository.deleteById(id);
    }
}
