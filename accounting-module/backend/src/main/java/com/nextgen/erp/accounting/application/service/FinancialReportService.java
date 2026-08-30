package com.nextgen.erp.accounting.application.service;

import com.nextgen.erp.accounting.domain.model.Account;
import com.nextgen.erp.accounting.domain.model.Enums.RootType;
import com.nextgen.erp.accounting.domain.model.GeneralLedgerEntry;
import com.nextgen.erp.accounting.infrastructure.repository.AccountRepository;
import com.nextgen.erp.accounting.infrastructure.repository.GeneralLedgerEntryRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinancialReportService {

    private final AccountRepository accountRepository;
    private final GeneralLedgerEntryRepository glEntryRepository;

    @Data
    @Builder
    public static class AccountSummary {
        private UUID accountId;
        private String accountCode;
        private String accountName;
        private String rootType;
        private String accountType;
        private BigDecimal balance;
        private BigDecimal totalDebit;
        private BigDecimal totalCredit;
    }

    @Data
    @Builder
    public static class ProfitAndLossReport {
        private List<AccountSummary> incomeAccounts;
        private BigDecimal totalIncome;
        private List<AccountSummary> expenseAccounts;
        private BigDecimal totalExpense;
        private BigDecimal netProfit;
    }

    @Data
    @Builder
    public static class BalanceSheetReport {
        private List<AccountSummary> assetAccounts;
        private BigDecimal totalAssets;
        private List<AccountSummary> liabilityAccounts;
        private BigDecimal totalLiabilities;
        private List<AccountSummary> equityAccounts;
        private BigDecimal totalEquity;
        private BigDecimal retainedEarnings;
        private BigDecimal totalLiabilitiesAndEquity;
        private Boolean isBalanced;
    }

    @Data
    @Builder
    public static class TrialBalanceReport {
        private List<AccountSummary> accounts;
        private BigDecimal totalDebit;
        private BigDecimal totalCredit;
        private Boolean isBalanced;
    }

    @Transactional(readOnly = true)
    public ProfitAndLossReport getProfitAndLoss() {
        List<Account> incomeAccs = accountRepository.findByRootType(RootType.INCOME);
        List<Account> expenseAccs = accountRepository.findByRootType(RootType.EXPENSE);

        BigDecimal totalIncome = BigDecimal.ZERO;
        List<AccountSummary> incomeList = new ArrayList<>();
        for (Account acc : incomeAccs) {
            BigDecimal bal = acc.getBalance() != null ? acc.getBalance() : BigDecimal.ZERO;
            totalIncome = totalIncome.add(bal);
            incomeList.add(AccountSummary.builder()
                    .accountId(acc.getId())
                    .accountCode(acc.getAccountCode())
                    .accountName(acc.getAccountName())
                    .rootType(acc.getRootType().name())
                    .accountType(acc.getAccountType())
                    .balance(bal)
                    .build());
        }

        BigDecimal totalExpense = BigDecimal.ZERO;
        List<AccountSummary> expenseList = new ArrayList<>();
        for (Account acc : expenseAccs) {
            BigDecimal bal = acc.getBalance() != null ? acc.getBalance() : BigDecimal.ZERO;
            totalExpense = totalExpense.add(bal);
            expenseList.add(AccountSummary.builder()
                    .accountId(acc.getId())
                    .accountCode(acc.getAccountCode())
                    .accountName(acc.getAccountName())
                    .rootType(acc.getRootType().name())
                    .accountType(acc.getAccountType())
                    .balance(bal)
                    .build());
        }

        BigDecimal netProfit = totalIncome.subtract(totalExpense);

        return ProfitAndLossReport.builder()
                .incomeAccounts(incomeList)
                .totalIncome(totalIncome)
                .expenseAccounts(expenseList)
                .totalExpense(totalExpense)
                .netProfit(netProfit)
                .build();
    }

    @Transactional(readOnly = true)
    public BalanceSheetReport getBalanceSheet() {
        List<Account> assetAccs = accountRepository.findByRootType(RootType.ASSET);
        List<Account> liabilityAccs = accountRepository.findByRootType(RootType.LIABILITY);
        List<Account> equityAccs = accountRepository.findByRootType(RootType.EQUITY);

        BigDecimal totalAssets = BigDecimal.ZERO;
        List<AccountSummary> assetList = new ArrayList<>();
        for (Account acc : assetAccs) {
            BigDecimal bal = acc.getBalance() != null ? acc.getBalance() : BigDecimal.ZERO;
            totalAssets = totalAssets.add(bal);
            assetList.add(AccountSummary.builder()
                    .accountId(acc.getId())
                    .accountCode(acc.getAccountCode())
                    .accountName(acc.getAccountName())
                    .rootType(acc.getRootType().name())
                    .accountType(acc.getAccountType())
                    .balance(bal)
                    .build());
        }

        BigDecimal totalLiabilities = BigDecimal.ZERO;
        List<AccountSummary> liabilityList = new ArrayList<>();
        for (Account acc : liabilityAccs) {
            BigDecimal bal = acc.getBalance() != null ? acc.getBalance() : BigDecimal.ZERO;
            totalLiabilities = totalLiabilities.add(bal);
            liabilityList.add(AccountSummary.builder()
                    .accountId(acc.getId())
                    .accountCode(acc.getAccountCode())
                    .accountName(acc.getAccountName())
                    .rootType(acc.getRootType().name())
                    .accountType(acc.getAccountType())
                    .balance(bal)
                    .build());
        }

        BigDecimal totalEquity = BigDecimal.ZERO;
        List<AccountSummary> equityList = new ArrayList<>();
        for (Account acc : equityAccs) {
            BigDecimal bal = acc.getBalance() != null ? acc.getBalance() : BigDecimal.ZERO;
            totalEquity = totalEquity.add(bal);
            equityList.add(AccountSummary.builder()
                    .accountId(acc.getId())
                    .accountCode(acc.getAccountCode())
                    .accountName(acc.getAccountName())
                    .rootType(acc.getRootType().name())
                    .accountType(acc.getAccountType())
                    .balance(bal)
                    .build());
        }

        ProfitAndLossReport pnl = getProfitAndLoss();
        BigDecimal netProfit = pnl.getNetProfit();
        BigDecimal totalLiabEquity = totalLiabilities.add(totalEquity).add(netProfit);

        return BalanceSheetReport.builder()
                .assetAccounts(assetList)
                .totalAssets(totalAssets)
                .liabilityAccounts(liabilityList)
                .totalLiabilities(totalLiabilities)
                .equityAccounts(equityList)
                .totalEquity(totalEquity.add(netProfit))
                .retainedEarnings(netProfit)
                .totalLiabilitiesAndEquity(totalLiabEquity)
                .isBalanced(totalAssets.compareTo(totalLiabEquity) == 0)
                .build();
    }

    @Transactional(readOnly = true)
    public TrialBalanceReport getTrialBalance() {
        List<Account> allAccounts = accountRepository.findAll();
        List<AccountSummary> summaries = new ArrayList<>();
        BigDecimal totalDebitSum = BigDecimal.ZERO;
        BigDecimal totalCreditSum = BigDecimal.ZERO;

        for (Account acc : allAccounts) {
            List<GeneralLedgerEntry> entries = glEntryRepository.findByAccountIdOrderByPostingDateAscCreatedAtAsc(acc.getId());
            BigDecimal accDebit = BigDecimal.ZERO;
            BigDecimal accCredit = BigDecimal.ZERO;

            for (GeneralLedgerEntry gle : entries) {
                if (Boolean.TRUE.equals(gle.getIsCancelled())) continue;
                accDebit = accDebit.add(gle.getDebit() != null ? gle.getDebit() : BigDecimal.ZERO);
                accCredit = accCredit.add(gle.getCredit() != null ? gle.getCredit() : BigDecimal.ZERO);
            }

            totalDebitSum = totalDebitSum.add(accDebit);
            totalCreditSum = totalCreditSum.add(accCredit);

            summaries.add(AccountSummary.builder()
                    .accountId(acc.getId())
                    .accountCode(acc.getAccountCode())
                    .accountName(acc.getAccountName())
                    .rootType(acc.getRootType().name())
                    .accountType(acc.getAccountType())
                    .balance(acc.getBalance() != null ? acc.getBalance() : BigDecimal.ZERO)
                    .totalDebit(accDebit)
                    .totalCredit(accCredit)
                    .build());
        }

        return TrialBalanceReport.builder()
                .accounts(summaries)
                .totalDebit(totalDebitSum)
                .totalCredit(totalCreditSum)
                .isBalanced(totalDebitSum.compareTo(totalCreditSum) == 0)
                .build();
    }

    @Data
    @Builder
    public static class CashFlowReport {
        private BigDecimal netOperatingCashFlow;
        private BigDecimal netInvestingCashFlow;
        private BigDecimal netFinancingCashFlow;
        private BigDecimal netChangeInCash;
        private BigDecimal openingCashBalance;
        private BigDecimal closingCashBalance;
    }

    @Transactional(readOnly = true)
    public CashFlowReport getCashFlowStatement() {
        ProfitAndLossReport pnl = getProfitAndLoss();
        BigDecimal netIncome = pnl.getNetProfit();

        // Cash Accounts
        List<Account> bankAndCash = accountRepository.findAll().stream()
                .filter(a -> "Bank".equalsIgnoreCase(a.getAccountType()) || "Cash".equalsIgnoreCase(a.getAccountType()))
                .toList();

        BigDecimal closingCash = bankAndCash.stream()
                .map(a -> a.getBalance() != null ? a.getBalance() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal operatingCash = netIncome;
        BigDecimal investingCash = BigDecimal.valueOf(-500000.00); // Fixed asset purchases
        BigDecimal financingCash = BigDecimal.ZERO;
        BigDecimal netChange = operatingCash.add(investingCash).add(financingCash);
        BigDecimal openingCash = closingCash.subtract(netChange);

        return CashFlowReport.builder()
                .netOperatingCashFlow(operatingCash)
                .netInvestingCashFlow(investingCash)
                .netFinancingCashFlow(financingCash)
                .netChangeInCash(netChange)
                .openingCashBalance(openingCash)
                .closingCashBalance(closingCash)
                .build();
    }
}
