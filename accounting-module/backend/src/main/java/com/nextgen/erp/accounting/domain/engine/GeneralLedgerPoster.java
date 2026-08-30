package com.nextgen.erp.accounting.domain.engine;

import com.nextgen.erp.accounting.domain.model.Account;
import com.nextgen.erp.accounting.domain.model.Enums.RootType;
import com.nextgen.erp.accounting.domain.model.GeneralLedgerEntry;
import com.nextgen.erp.accounting.infrastructure.repository.AccountRepository;
import com.nextgen.erp.accounting.infrastructure.repository.GeneralLedgerEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class GeneralLedgerPoster {

    private final GeneralLedgerEntryRepository glEntryRepository;
    private final AccountRepository accountRepository;

    @Transactional
    public List<GeneralLedgerEntry> post(List<GeneralLedgerEntry> entries) {
        if (entries == null || entries.isEmpty()) {
            return List.of();
        }

        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;

        for (GeneralLedgerEntry entry : entries) {
            BigDecimal debit = entry.getDebit() != null ? entry.getDebit() : BigDecimal.ZERO;
            BigDecimal credit = entry.getCredit() != null ? entry.getCredit() : BigDecimal.ZERO;
            totalDebit = totalDebit.add(debit);
            totalCredit = totalCredit.add(credit);
        }

        // Validate double-entry balancing invariant
        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new IllegalArgumentException(String.format(
                    "Accounting Error: Unbalanced General Ledger Entry. Total Debit (₹%s) != Total Credit (₹%s)",
                    totalDebit, totalCredit));
        }

        // Update Account Balances based on standard Accounting Equation
        for (GeneralLedgerEntry entry : entries) {
            Account account = entry.getAccount();
            if (account != null) {
                BigDecimal debit = entry.getDebit() != null ? entry.getDebit() : BigDecimal.ZERO;
                BigDecimal credit = entry.getCredit() != null ? entry.getCredit() : BigDecimal.ZERO;
                BigDecimal currentBalance = account.getBalance() != null ? account.getBalance() : BigDecimal.ZERO;

                if (account.getRootType() == RootType.ASSET || account.getRootType() == RootType.EXPENSE) {
                    // Normal Debit Balance
                    account.setBalance(currentBalance.add(debit).subtract(credit));
                } else {
                    // Normal Credit Balance (Liability, Equity, Income)
                    account.setBalance(currentBalance.add(credit).subtract(debit));
                }
                accountRepository.save(account);
            }
        }

        return glEntryRepository.saveAll(entries);
    }
}
