package com.nextgen.erp.accounting.application.service;

import com.nextgen.erp.accounting.domain.engine.GeneralLedgerPoster;
import com.nextgen.erp.accounting.domain.model.Account;
import com.nextgen.erp.accounting.domain.model.Enums.InvoiceStatus;
import com.nextgen.erp.accounting.domain.model.Enums.PartyType;
import com.nextgen.erp.accounting.domain.model.Enums.VoucherType;
import com.nextgen.erp.accounting.domain.model.GeneralLedgerEntry;
import com.nextgen.erp.accounting.domain.model.SalesInvoice;
import com.nextgen.erp.accounting.domain.model.SalesInvoiceItem;
import com.nextgen.erp.accounting.infrastructure.repository.AccountRepository;
import com.nextgen.erp.accounting.infrastructure.repository.SalesInvoiceRepository;
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
public class SalesInvoiceService {

    private final SalesInvoiceRepository salesInvoiceRepository;
    private final AccountRepository accountRepository;
    private final GeneralLedgerPoster glPoster;

    @Transactional(readOnly = true)
    public List<SalesInvoice> getAllSalesInvoices() {
        return salesInvoiceRepository.findAllByOrderByPostingDateDesc();
    }

    @Transactional(readOnly = true)
    public Optional<SalesInvoice> getSalesInvoiceById(UUID id) {
        return salesInvoiceRepository.findById(id);
    }

    @Transactional
    public SalesInvoice createSalesInvoice(SalesInvoice invoice) {
        if (invoice.getInvoiceNumber() == null || invoice.getInvoiceNumber().isBlank()) {
            long count = salesInvoiceRepository.count() + 1;
            invoice.setInvoiceNumber(String.format("SINV-%d-%04d", LocalDate.now().getYear(), count));
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        if (invoice.getItems() != null) {
            for (SalesInvoiceItem item : invoice.getItems()) {
                item.setSalesInvoice(invoice);
                BigDecimal qty = item.getQuantity() != null ? item.getQuantity() : BigDecimal.ONE;
                BigDecimal rate = item.getRate() != null ? item.getRate() : BigDecimal.ZERO;
                BigDecimal amount = qty.multiply(rate).setScale(2, RoundingMode.HALF_UP);
                item.setAmount(amount);

                BigDecimal taxRate = item.getTaxRate() != null ? item.getTaxRate() : BigDecimal.valueOf(18.0);
                BigDecimal itemTax = amount.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                subtotal = subtotal.add(amount);
                totalTax = totalTax.add(itemTax);
            }
        }

        BigDecimal grandTotal = subtotal.add(totalTax);
        invoice.setSubtotal(subtotal);
        invoice.setTotalTax(totalTax);
        invoice.setGrandTotal(grandTotal);
        invoice.setRoundedTotal(grandTotal);
        invoice.setOutstandingAmount(grandTotal);
        invoice.setStatus(InvoiceStatus.SUBMITTED);

        SalesInvoice saved = salesInvoiceRepository.save(invoice);

        // Auto-Post GL Entries for Accounts Receivable
        Account debtorAccount = accountRepository.findByAccountCode("1130")
                .orElseGet(() -> accountRepository.findAll().stream()
                        .filter(a -> "Receivable".equalsIgnoreCase(a.getAccountType()))
                        .findFirst()
                        .orElse(null));

        Account salesAccount = accountRepository.findByAccountCode("4100")
                .orElseGet(() -> accountRepository.findAll().stream()
                        .filter(a -> "Direct Income".equalsIgnoreCase(a.getAccountType()))
                        .findFirst()
                        .orElse(null));

        Account taxAccount = accountRepository.findByAccountCode("2120")
                .orElseGet(() -> accountRepository.findAll().stream()
                        .filter(a -> "Tax".equalsIgnoreCase(a.getAccountType()))
                        .findFirst()
                        .orElse(null));

        if (debtorAccount != null && salesAccount != null) {
            List<GeneralLedgerEntry> glEntries = new ArrayList<>();

            // 1. Debit Accounts Receivable (Full Grand Total)
            glEntries.add(GeneralLedgerEntry.builder()
                    .postingDate(saved.getPostingDate())
                    .account(debtorAccount)
                    .voucherType(VoucherType.SALES_INVOICE)
                    .voucherNumber(saved.getInvoiceNumber())
                    .voucherId(saved.getId())
                    .debit(grandTotal)
                    .credit(BigDecimal.ZERO)
                    .againstAccount(salesAccount.getAccountName())
                    .partyType(PartyType.CUSTOMER)
                    .partyName(saved.getCustomerName())
                    .remarks("Sales Invoice issued to " + saved.getCustomerName())
                    .build());

            // 2. Credit Sales Income (Subtotal)
            glEntries.add(GeneralLedgerEntry.builder()
                    .postingDate(saved.getPostingDate())
                    .account(salesAccount)
                    .voucherType(VoucherType.SALES_INVOICE)
                    .voucherNumber(saved.getInvoiceNumber())
                    .voucherId(saved.getId())
                    .debit(BigDecimal.ZERO)
                    .credit(subtotal)
                    .againstAccount(debtorAccount.getAccountName())
                    .partyType(PartyType.CUSTOMER)
                    .partyName(saved.getCustomerName())
                    .remarks("Direct Sales Revenue from " + saved.getCustomerName())
                    .build());

            // 3. Credit Output Taxes (if any)
            if (totalTax.compareTo(BigDecimal.ZERO) > 0 && taxAccount != null) {
                glEntries.add(GeneralLedgerEntry.builder()
                        .postingDate(saved.getPostingDate())
                        .account(taxAccount)
                        .voucherType(VoucherType.SALES_INVOICE)
                        .voucherNumber(saved.getInvoiceNumber())
                        .voucherId(saved.getId())
                        .debit(BigDecimal.ZERO)
                        .credit(totalTax)
                        .againstAccount(debtorAccount.getAccountName())
                        .partyType(PartyType.CUSTOMER)
                        .partyName(saved.getCustomerName())
                        .remarks("GST Output Tax on Sales Invoice " + saved.getInvoiceNumber())
                        .build());
            }

            glPoster.post(glEntries);
        }

        return saved;
    }

    @Transactional
    public void deleteSalesInvoice(UUID id) {
        salesInvoiceRepository.deleteById(id);
    }
}
