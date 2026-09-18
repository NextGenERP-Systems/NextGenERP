package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "mrp_mock_stock_ledger")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockStockLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "item_code", nullable = false)
    private String itemCode;

    @Column(name = "warehouse_id", nullable = false)
    private String warehouseId;

    @Column(name = "actual_qty", nullable = false, precision = 15, scale = 4)
    private BigDecimal actualQty;

    @Column(name = "valuation_rate", nullable = false, precision = 15, scale = 4)
    private BigDecimal valuationRate;

    @Column(name = "voucher_type", nullable = false)
    private String voucherType;

    @Column(name = "voucher_no", nullable = false)
    private String voucherNo;

    @Column(name = "posting_date")
    private ZonedDateTime postingDate;
}
