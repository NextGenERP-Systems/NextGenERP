package com.nextgen.erp.accounting.application.service;

import com.nextgen.erp.accounting.domain.model.Account;
import com.nextgen.erp.accounting.domain.model.BankAccount;
import com.nextgen.erp.accounting.domain.model.BankClearanceRequest;
import com.nextgen.erp.accounting.domain.model.BankReconciliationDto;
import com.nextgen.erp.accounting.domain.model.GeneralLedgerEntry;
import com.nextgen.erp.accounting.infrastructure.repository.BankAccountRepository;
import com.nextgen.erp.accounting.infrastructure.repository.GeneralLedgerEntryRepository;
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
public class BankingService {

    private final BankAccountRepository bankAccountRepository;
    private final GeneralLedgerEntryRepository glEntryRepository;

    @Transactional(readOnly = true)
    public List<BankAccount> getAllBankAccounts() {
        return bankAccountRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<BankAccount> getBankAccountById(UUID id) {
        return bankAccountRepository.findById(id);
    }

    @Transactional
    public BankAccount createBankAccount(BankAccount account) {
        return bankAccountRepository.save(account);
    }

    @Transactional
    public void deleteBankAccount(UUID id) {
        bankAccountRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public BankReconciliationDto getBankReconciliationSheet(UUID bankAccountId, BigDecimal statementBalance, LocalDate statementDate) {
        BankAccount bankAccount = bankAccountRepository.findById(bankAccountId)
                .orElseThrow(() -> new IllegalArgumentException("Bank Account not found with ID: " + bankAccountId));

        Account glAccount = bankAccount.getGlAccount();
        if (glAccount == null) {
            throw new IllegalStateException("Bank Account is not linked to any General Ledger Account");
        }

        LocalDate asOfDate = statementDate != null ? statementDate : LocalDate.now();
        BigDecimal stmtBal = statementBalance != null ? statementBalance : 
                (bankAccount.getCurrentBalance() != null ? bankAccount.getCurrentBalance() : BigDecimal.ZERO);

        // Calculate General Ledger balance up to the statement date
        List<GeneralLedgerEntry> activeEntries = glEntryRepository.findActiveEntriesForAccountAsOf(glAccount.getId(), asOfDate);
        BigDecimal glBalance = BigDecimal.ZERO;
        for (GeneralLedgerEntry g : activeEntries) {
            BigDecimal deb = g.getDebit() != null ? g.getDebit() : BigDecimal.ZERO;
            BigDecimal cred = g.getCredit() != null ? g.getCredit() : BigDecimal.ZERO;
            glBalance = glBalance.add(deb).subtract(cred);
        }

        // Fetch entries for this bank GL account
        List<GeneralLedgerEntry> allGlEntries = glEntryRepository.findByAccountIdAndIsCancelledFalseOrderByPostingDateDesc(glAccount.getId());

        List<BankReconciliationDto.UnclearedTransactionDto> transactionDtos = new ArrayList<>();
        BigDecimal depositsInTransit = BigDecimal.ZERO;
        BigDecimal outstandingPayments = BigDecimal.ZERO;

        for (GeneralLedgerEntry entry : allGlEntries) {
            boolean isCleared = entry.getClearanceDate() != null && !entry.getClearanceDate().isAfter(asOfDate);
            BigDecimal debit = entry.getDebit() != null ? entry.getDebit() : BigDecimal.ZERO;
            BigDecimal credit = entry.getCredit() != null ? entry.getCredit() : BigDecimal.ZERO;
            boolean isDeposit = debit.compareTo(BigDecimal.ZERO) > 0;

            if (!isCleared) {
                if (isDeposit) {
                    depositsInTransit = depositsInTransit.add(debit);
                } else {
                    outstandingPayments = outstandingPayments.add(credit);
                }
            }

            transactionDtos.add(BankReconciliationDto.UnclearedTransactionDto.builder()
                    .voucherId(entry.getVoucherId() != null ? entry.getVoucherId().toString() : entry.getId().toString())
                    .voucherNumber(entry.getVoucherNumber())
                    .voucherType(entry.getVoucherType() != null ? entry.getVoucherType().name() : "JOURNAL_ENTRY")
                    .postingDate(entry.getPostingDate())
                    .partyType(entry.getPartyType() != null ? entry.getPartyType().name() : null)
                    .partyName(entry.getPartyName())
                    .debit(debit)
                    .credit(credit)
                    .isDeposit(isDeposit)
                    .isCleared(isCleared)
                    .clearanceDate(entry.getClearanceDate())
                    .build());
        }

        // Bank Reconciliation Formula:
        // Calculated Book Balance = Bank Statement Balance + Deposits In Transit - Outstanding Payments
        BigDecimal calculatedBookBalance = stmtBal.add(depositsInTransit).subtract(outstandingPayments);
        BigDecimal variance = calculatedBookBalance.subtract(glBalance);
        boolean isReconciled = variance.compareTo(BigDecimal.ZERO) == 0;

        return BankReconciliationDto.builder()
                .bankAccountId(bankAccount.getId())
                .accountName(bankAccount.getAccountName())
                .bankName(bankAccount.getBankName())
                .accountNumber(bankAccount.getAccountNumber())
                .bankStatementBalance(stmtBal)
                .generalLedgerBalance(glBalance)
                .depositsInTransit(depositsInTransit)
                .outstandingPayments(outstandingPayments)
                .calculatedBookBalance(calculatedBookBalance)
                .variance(variance)
                .isReconciled(isReconciled)
                .unclearedTransactions(transactionDtos)
                .build();
    }

    @Transactional
    public BankReconciliationDto clearBankVouchers(UUID bankAccountId, BankClearanceRequest request) {
        BankAccount bankAccount = bankAccountRepository.findById(bankAccountId)
                .orElseThrow(() -> new IllegalArgumentException("Bank Account not found with ID: " + bankAccountId));

        Account glAccount = bankAccount.getGlAccount();
        if (glAccount == null) {
            throw new IllegalStateException("Bank Account has no linked GL Account");
        }

        if (request != null && request.getItems() != null) {
            for (BankClearanceRequest.ClearanceItem item : request.getItems()) {
                if (item.getVoucherNumber() != null) {
                    List<GeneralLedgerEntry> entries = glEntryRepository.findByVoucherNumber(item.getVoucherNumber());
                    for (GeneralLedgerEntry entry : entries) {
                        if (entry.getAccount() != null && entry.getAccount().getId().equals(glAccount.getId())) {
                            entry.setClearanceDate(item.getClearanceDate() != null ? item.getClearanceDate() : LocalDate.now());
                            glEntryRepository.save(entry);
                        }
                    }
                }
            }
        }

        return getBankReconciliationSheet(bankAccountId, null, null);
    }
}
