package com.nextgen.erp.stock.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "bins", schema = "stock", uniqueConstraints = {
    @UniqueConstraint(name = "uq_bin_item_warehouse", columnNames = {"item_id", "warehouse_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bin {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "item_id", nullable = false, length = 64)
    private String itemId;

    @Column(name = "warehouse_id", nullable = false, length = 64)
    private String warehouseId;

    @Column(name = "actual_qty", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal actualQty = BigDecimal.ZERO;

    @Column(name = "ordered_qty", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal orderedQty = BigDecimal.ZERO;

    @Column(name = "reserved_qty", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal reservedQty = BigDecimal.ZERO;

    @Column(name = "indented_qty", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal indentedQty = BigDecimal.ZERO;

    @Column(name = "planned_qty", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal plannedQty = BigDecimal.ZERO;

    @Column(name = "projected_qty", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal projectedQty = BigDecimal.ZERO;

    @Column(name = "valuation_rate", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal valuationRate = BigDecimal.ZERO;

    @Column(name = "stock_value", precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal stockValue = BigDecimal.ZERO;

    @Column(name = "stock_queue", columnDefinition = "TEXT")
    @Builder.Default
    private String stockQueue = "[]";

    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    public void recalculateProjectedQty() {
        BigDecimal actual = this.actualQty != null ? this.actualQty : BigDecimal.ZERO;
        BigDecimal ordered = this.orderedQty != null ? this.orderedQty : BigDecimal.ZERO;
        BigDecimal planned = this.plannedQty != null ? this.plannedQty : BigDecimal.ZERO;
        BigDecimal reserved = this.reservedQty != null ? this.reservedQty : BigDecimal.ZERO;
        BigDecimal indented = this.indentedQty != null ? this.indentedQty : BigDecimal.ZERO;

        this.projectedQty = actual.add(ordered).add(planned).subtract(reserved).subtract(indented);
    }
}
