package com.nextgen.erp.stock.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "stock_entry_items", schema = "stock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockEntryItem {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_entry_id", nullable = false)
    @JsonIgnore
    private StockEntry stockEntry;

    @Column(name = "item_id", nullable = false, length = 64)
    private String itemId;

    @Column(name = "source_warehouse_id", length = 64)
    private String sourceWarehouseId;

    @Column(name = "target_warehouse_id", length = 64)
    private String targetWarehouseId;

    @Column(nullable = false, precision = 18, scale = 4)
    private BigDecimal qty;

    @Column(name = "uom_id", length = 64)
    private String uomId;

    @Column(name = "basic_rate", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal basicRate = BigDecimal.ZERO;

    @Column(precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "additional_cost", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal additionalCost = BigDecimal.ZERO;

    @Column(name = "valuation_rate", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal valuationRate = BigDecimal.ZERO;

    @Column(name = "batch_id", length = 64)
    private String batchId;

    @Column(name = "serial_nos", columnDefinition = "TEXT")
    private String serialNos;

    @Column(name = "is_scrap_item")
    @Builder.Default
    private Boolean isScrapItem = false;

    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
