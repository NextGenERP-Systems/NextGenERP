package com.nextgen.erp.accounting.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerpetualStockGlRequest {
    private String voucherType; // 'STOCK_ENTRY', 'DELIVERY_NOTE', 'PURCHASE_RECEIPT', 'LANDED_COST_VOUCHER'
    private String voucherNumber;
    private String voucherId;
    private LocalDate postingDate;
    private String transactionNature; // 'RECEIPT', 'DELIVERY', 'LANDED_COST', 'VARIANCE_SURPLUS', 'VARIANCE_SHORTAGE'
    private BigDecimal amount;
    private String itemSummary;
    private String remarks;
}
