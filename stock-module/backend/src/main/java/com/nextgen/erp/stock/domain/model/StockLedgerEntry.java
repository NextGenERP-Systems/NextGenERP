package com.nextgen.erp.stock.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;

@Entity
@Table(name = "stock_ledger_entries", schema = "stock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockLedgerEntry {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "item_id", nullable = false, length = 64)
    private String itemId;

    @Column(name = "warehouse_id", nullable = false, length = 64)
    private String warehouseId;

    @Column(name = "posting_date", nullable = false)
    private LocalDate postingDate;

    @Column(name = "posting_time", nullable = false)
    private LocalTime postingTime;

    @Column(name = "voucher_type", nullable = false, length = 64)
    private String voucherType;

    @Column(name = "voucher_no", nullable = false, length = 100)
    private String voucherNo;

    @Column(name = "voucher_detail_no", length = 100)
    private String voucherDetailNo;

    @Column(name = "actual_qty", nullable = false, precision = 18, scale = 4)
    private BigDecimal actualQty;

    @Column(name = "qty_after_transaction", nullable = false, precision = 18, scale = 4)
    private BigDecimal qtyAfterTransaction;

    @Column(name = "incoming_rate", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal incomingRate = BigDecimal.ZERO;

    @Column(name = "valuation_rate", nullable = false, precision = 18, scale = 4)
    private BigDecimal valuationRate;

    @Column(name = "stock_value", nullable = false, precision = 18, scale = 4)
    private BigDecimal stockValue;

    @Column(name = "stock_value_difference", nullable = false, precision = 18, scale = 4)
    private BigDecimal stockValueDifference;

    @Column(name = "batch_id", length = 64)
    private String batchId;

    @Column(name = "serial_nos", columnDefinition = "TEXT")
    private String serialNos;

    @Column(name = "stock_queue", columnDefinition = "TEXT")
    private String stockQueue;

    @Column(name = "is_cancelled")
    @Builder.Default
    private Boolean isCancelled = false;

    @Column(name = "fiscal_year", length = 20)
    private String fiscalYear;

    @Column(length = 150)
    @Builder.Default
    private String company = "NextGen Corp";

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
