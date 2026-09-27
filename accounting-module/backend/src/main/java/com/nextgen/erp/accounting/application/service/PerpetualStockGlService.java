package com.nextgen.erp.accounting.application.service;

import com.nextgen.erp.accounting.domain.engine.GeneralLedgerPoster;
import com.nextgen.erp.accounting.domain.model.Account;
import com.nextgen.erp.accounting.domain.model.Enums.RootType;
import com.nextgen.erp.accounting.domain.model.Enums.VoucherType;
import com.nextgen.erp.accounting.domain.model.GeneralLedgerEntry;
import com.nextgen.erp.accounting.domain.model.PerpetualStockGlRequest;
import com.nextgen.erp.accounting.infrastructure.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PerpetualStockGlService {

    private final AccountRepository accountRepository;
    private final GeneralLedgerPoster glPoster;

    @Transactional
    public List<GeneralLedgerEntry> postPerpetualStockGl(PerpetualStockGlRequest request) {
        if (request == null || request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Perpetual inventory posting requires a valid positive amount");
        }

        LocalDate postingDate = request.getPostingDate() != null ? request.getPostingDate() : LocalDate.now();
        BigDecimal amount = request.getAmount();

        VoucherType vType;
        try {
            vType = VoucherType.valueOf(request.getVoucherType());
        } catch (Exception e) {
            vType = VoucherType.STOCK_ENTRY;
        }

        UUID voucherUuid;
        try {
            voucherUuid = request.getVoucherId() != null ? UUID.fromString(request.getVoucherId()) : UUID.randomUUID();
        } catch (Exception e) {
            voucherUuid = UUID.randomUUID();
        }

        Account debitAccount;
        Account creditAccount;
        String nature = request.getTransactionNature() != null ? request.getTransactionNature().toUpperCase() : "RECEIPT";

        switch (nature) {
            case "RECEIPT":
            case "PURCHASE_RECEIPT":
                // Debit: Stock In Hand (Asset+), Credit: Stock Received But Not Billed (Liability+)
                debitAccount = getOrCreateAccount("1130", "Stock In Hand", RootType.ASSET, "Stock");
                creditAccount = getOrCreateAccount("2120", "Stock Received But Not Billed", RootType.LIABILITY, "Stock Received But Not Billed");
                break;

            case "DELIVERY":
            case "DELIVERY_NOTE":
                // Debit: Cost of Goods Sold (Expense+), Credit: Stock In Hand (Asset-)
                debitAccount = getOrCreateAccount("5110", "Cost of Goods Sold", RootType.EXPENSE, "Cost of Goods Sold");
                creditAccount = getOrCreateAccount("1130", "Stock In Hand", RootType.ASSET, "Stock");
                break;

            case "LANDED_COST":
                // Debit: Stock In Hand (Asset+), Credit: Expenses Included In Valuation (Expense Clearing-)
                debitAccount = getOrCreateAccount("1130", "Stock In Hand", RootType.ASSET, "Stock");
                creditAccount = getOrCreateAccount("5120", "Expenses Included In Valuation", RootType.EXPENSE, "Expenses Included In Valuation");
                break;

            case "VARIANCE_SURPLUS":
                // Physical stock > Book stock: Debit: Stock In Hand, Credit: Stock Adjustment Surplus (Income)
                debitAccount = getOrCreateAccount("1130", "Stock In Hand", RootType.ASSET, "Stock");
                creditAccount = getOrCreateAccount("4150", "Stock Adjustment Surplus", RootType.INCOME, "Stock Adjustment");
                break;

            case "VARIANCE_SHORTAGE":
            default:
                // Physical stock < Book stock: Debit: Stock Adjustment Loss (Expense), Credit: Stock In Hand
                debitAccount = getOrCreateAccount("5130", "Stock Adjustment Loss", RootType.EXPENSE, "Stock Adjustment");
                creditAccount = getOrCreateAccount("1130", "Stock In Hand", RootType.ASSET, "Stock");
                break;
        }

        String remarks = (request.getRemarks() != null ? request.getRemarks() : "") + 
                (request.getItemSummary() != null ? " | Items: " + request.getItemSummary() : "");

        List<GeneralLedgerEntry> entries = new ArrayList<>();

        // Debit Leg
        entries.add(GeneralLedgerEntry.builder()
                .postingDate(postingDate)
                .account(debitAccount)
                .voucherType(vType)
                .voucherNumber(request.getVoucherNumber())
                .voucherId(voucherUuid)
                .debit(amount)
                .credit(BigDecimal.ZERO)
                .againstAccount(creditAccount.getAccountName())
                .remarks(remarks.trim())
                .build());

        // Credit Leg
        entries.add(GeneralLedgerEntry.builder()
                .postingDate(postingDate)
                .account(creditAccount)
                .voucherType(vType)
                .voucherNumber(request.getVoucherNumber())
                .voucherId(voucherUuid)
                .debit(BigDecimal.ZERO)
                .credit(amount)
                .againstAccount(debitAccount.getAccountName())
                .remarks(remarks.trim())
                .build());

        log.info("Posting perpetual stock GL for voucher {} (nature={}): Debit {} ₹{}, Credit {} ₹{}",
                request.getVoucherNumber(), nature, debitAccount.getAccountName(), amount, creditAccount.getAccountName(), amount);

        return glPoster.post(entries);
    }

    private Account getOrCreateAccount(String accountCode, String accountName, RootType rootType, String accountType) {
        return accountRepository.findByAccountCode(accountCode)
                .orElseGet(() -> {
                    Account acc = Account.builder()
                            .accountCode(accountCode)
                            .accountName(accountName)
                            .rootType(rootType)
                            .accountType(accountType)
                            .balance(BigDecimal.ZERO)
                            .isGroup(false)
                            .isActive(true)
                            .currency("INR")
                            .build();
                    return accountRepository.save(acc);
                });
    }
}
