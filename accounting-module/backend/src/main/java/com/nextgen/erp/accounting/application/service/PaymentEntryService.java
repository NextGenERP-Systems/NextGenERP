package com.nextgen.erp.accounting.application.service;

import com.nextgen.erp.accounting.domain.engine.GeneralLedgerPoster;
import com.nextgen.erp.accounting.domain.model.Account;
import com.nextgen.erp.accounting.domain.model.Enums.VoucherType;
import com.nextgen.erp.accounting.domain.model.GeneralLedgerEntry;
import com.nextgen.erp.accounting.domain.model.PaymentEntry;
import com.nextgen.erp.accounting.infrastructure.repository.AccountRepository;
import com.nextgen.erp.accounting.infrastructure.repository.PaymentEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentEntryService {

    private final PaymentEntryRepository paymentEntryRepository;
    private final AccountRepository accountRepository;
    private final GeneralLedgerPoster glPoster;

    @Transactional(readOnly = true)
    public List<PaymentEntry> getAllPaymentEntries() {
        return paymentEntryRepository.findAllByOrderByPaymentDateDesc();
    }

    @Transactional(readOnly = true)
    public Optional<PaymentEntry> getPaymentEntryById(UUID id) {
        return paymentEntryRepository.findById(id);
    }

    @Transactional
    public PaymentEntry createPaymentEntry(PaymentEntry entry) {
        if (entry.getPaymentNumber() == null || entry.getPaymentNumber().isBlank()) {
            long count = paymentEntryRepository.count() + 1;
            entry.setPaymentNumber(String.format("PAY-%d-%04d", LocalDate.now().getYear(), count));
        }

        if (entry.getPaidAmount() == null) entry.setPaidAmount(BigDecimal.ZERO);
        if (entry.getReceivedAmount() == null) entry.setReceivedAmount(entry.getPaidAmount());

        Account fromAcc = entry.getPaidFromAccount();
        if (fromAcc != null && fromAcc.getId() != null) {
            fromAcc = accountRepository.findById(fromAcc.getId()).orElse(fromAcc);
            entry.setPaidFromAccount(fromAcc);
        }

        Account toAcc = entry.getPaidToAccount();
        if (toAcc != null && toAcc.getId() != null) {
            toAcc = accountRepository.findById(toAcc.getId()).orElse(toAcc);
            entry.setPaidToAccount(toAcc);
        }

        PaymentEntry saved = paymentEntryRepository.save(entry);

        BigDecimal amount = entry.getPaidAmount();
        if (fromAcc != null && toAcc != null && amount.compareTo(BigDecimal.ZERO) > 0) {
            List<GeneralLedgerEntry> glEntries = new ArrayList<>();

            // 1. Debit the target account (Paid To)
            glEntries.add(GeneralLedgerEntry.builder()
                    .postingDate(saved.getPaymentDate())
                    .account(toAcc)
                    .voucherType(VoucherType.PAYMENT_ENTRY)
                    .voucherNumber(saved.getPaymentNumber())
                    .voucherId(saved.getId())
                    .debit(amount)
                    .credit(BigDecimal.ZERO)
                    .againstAccount(fromAcc.getAccountName())
                    .partyType(saved.getPartyType())
                    .partyName(saved.getPartyName())
                    .remarks("Payment Entry " + saved.getPaymentNumber() + " - " + saved.getPaymentType())
                    .build());

            // 2. Credit the source account (Paid From)
            glEntries.add(GeneralLedgerEntry.builder()
                    .postingDate(saved.getPaymentDate())
                    .account(fromAcc)
                    .voucherType(VoucherType.PAYMENT_ENTRY)
                    .voucherNumber(saved.getPaymentNumber())
                    .voucherId(saved.getId())
                    .debit(BigDecimal.ZERO)
                    .credit(amount)
                    .againstAccount(toAcc.getAccountName())
                    .partyType(saved.getPartyType())
                    .partyName(saved.getPartyName())
                    .remarks("Payment Entry " + saved.getPaymentNumber() + " - " + saved.getPaymentType())
                    .build());

            glPoster.post(glEntries);
        }

        return saved;
    }

    @Transactional
    public void deletePaymentEntry(UUID id) {
        paymentEntryRepository.deleteById(id);
    }
}
