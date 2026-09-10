package com.nextgen.erp.accounting.application.service;

import com.nextgen.erp.accounting.domain.engine.GeneralLedgerPoster;
import com.nextgen.erp.accounting.domain.model.Account;
import com.nextgen.erp.accounting.domain.model.Enums.VoucherType;
import com.nextgen.erp.accounting.domain.model.GeneralLedgerEntry;
import com.nextgen.erp.accounting.domain.model.JournalEntry;
import com.nextgen.erp.accounting.domain.model.JournalEntryItem;
import com.nextgen.erp.accounting.infrastructure.repository.AccountRepository;
import com.nextgen.erp.accounting.infrastructure.repository.JournalEntryRepository;
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
public class JournalEntryService {

    private final JournalEntryRepository journalEntryRepository;
    private final AccountRepository accountRepository;
    private final GeneralLedgerPoster glPoster;

    @Transactional(readOnly = true)
    public List<JournalEntry> getAllJournalEntries() {
        return journalEntryRepository.findAllByOrderByPostingDateDesc();
    }

    @Transactional(readOnly = true)
    public Optional<JournalEntry> getJournalEntryById(UUID id) {
        return journalEntryRepository.findById(id);
    }

    @Transactional
    public JournalEntry createJournalEntry(JournalEntry journalEntry) {
        if (journalEntry.getVoucherNumber() == null || journalEntry.getVoucherNumber().isBlank()) {
            long count = journalEntryRepository.count() + 1;
            journalEntry.setVoucherNumber(String.format("JV-%d-%04d", LocalDate.now().getYear(), count));
        }

        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;
        List<GeneralLedgerEntry> glEntries = new ArrayList<>();

        if (journalEntry.getItems() != null) {
            for (JournalEntryItem item : journalEntry.getItems()) {
                item.setJournalEntry(journalEntry);
                Account account = item.getAccount();
                if (account != null && account.getId() != null) {
                    account = accountRepository.findById(account.getId()).orElse(account);
                    item.setAccount(account);
                }

                BigDecimal debit = item.getDebitAmount() != null ? item.getDebitAmount() : BigDecimal.ZERO;
                BigDecimal credit = item.getCreditAmount() != null ? item.getCreditAmount() : BigDecimal.ZERO;
                totalDebit = totalDebit.add(debit);
                totalCredit = totalCredit.add(credit);

                glEntries.add(GeneralLedgerEntry.builder()
                        .postingDate(journalEntry.getPostingDate() != null ? journalEntry.getPostingDate() : LocalDate.now())
                        .account(account)
                        .voucherType(VoucherType.JOURNAL_ENTRY)
                        .voucherNumber(journalEntry.getVoucherNumber())
                        .voucherId(journalEntry.getId() != null ? journalEntry.getId() : UUID.randomUUID())
                        .debit(debit)
                        .credit(credit)
                        .partyType(item.getPartyType())
                        .partyName(item.getPartyName())
                        .costCenter(item.getCostCenter())
                        .remarks(item.getRemarks() != null ? item.getRemarks() : journalEntry.getUserRemarks())
                        .build());
            }
        }

        journalEntry.setTotalDebit(totalDebit);
        journalEntry.setTotalCredit(totalCredit);

        JournalEntry saved = journalEntryRepository.save(journalEntry);

        // Update voucherId on GL entries and post to ledger
        for (GeneralLedgerEntry gle : glEntries) {
            gle.setVoucherId(saved.getId());
        }
        glPoster.post(glEntries);

        return saved;
    }

    @Transactional
    public void deleteJournalEntry(UUID id) {
        journalEntryRepository.deleteById(id);
    }
}
