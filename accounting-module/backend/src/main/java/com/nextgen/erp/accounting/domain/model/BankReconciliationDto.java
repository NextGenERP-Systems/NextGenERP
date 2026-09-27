package com.nextgen.erp.accounting.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankReconciliationDto {
    private UUID bankAccountId;
    private String accountName;
    private String bankName;
    private String accountNumber;
    private BigDecimal bankStatementBalance;
    private BigDecimal generalLedgerBalance;
    private BigDecimal depositsInTransit;
    private BigDecimal outstandingPayments;
    private BigDecimal calculatedBookBalance;
    private BigDecimal variance;
    private boolean isReconciled;
    private List<UnclearedTransactionDto> unclearedTransactions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UnclearedTransactionDto {
        private String voucherId;
        private String voucherNumber;
        private String voucherType;
        private LocalDate postingDate;
        private String partyType;
        private String partyName;
        private BigDecimal debit;
        private BigDecimal credit;
        private boolean isDeposit;
        private boolean isCleared;
        private LocalDate clearanceDate;
    }
}
