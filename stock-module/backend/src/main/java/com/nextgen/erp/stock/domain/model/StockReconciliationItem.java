package com.nextgen.erp.stock.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "stock_reconciliation_items", schema = "stock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockReconciliationItem {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reconciliation_id", nullable = false)
    @JsonIgnore
    private StockReconciliation reconciliation;

    @Column(name = "item_id", nullable = false, length = 64)
    private String itemId;

    @Column(name = "warehouse_id", nullable = false, length = 64)
    private String warehouseId;

    @Column(name = "current_qty", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal currentQty = BigDecimal.ZERO;

    @Column(name = "current_valuation_rate", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal currentValuationRate = BigDecimal.ZERO;

    @Column(name = "current_stock_value", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal currentStockValue = BigDecimal.ZERO;

    @Column(nullable = false, precision = 18, scale = 4)
    private BigDecimal qty; // Physical actual count

    @Column(name = "valuation_rate", nullable = false, precision = 18, scale = 4)
    private BigDecimal valuationRate;

    @Column(name = "amount_difference", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal amountDifference = BigDecimal.ZERO;

    @Column(name = "batch_id", length = 64)
    private String batchId;

    @Column(name = "serial_nos", columnDefinition = "TEXT")
    private String serialNos;

    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
