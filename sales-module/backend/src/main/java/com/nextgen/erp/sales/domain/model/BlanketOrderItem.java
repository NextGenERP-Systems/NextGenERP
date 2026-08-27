package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "blanket_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlanketOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blanket_order_id", nullable = false)
    private BlanketOrder blanketOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "qty", nullable = false, precision = 15, scale = 2)
    private BigDecimal qty;

    @Column(name = "rate", nullable = false, precision = 15, scale = 2)
    private BigDecimal rate;

    @Column(name = "ordered_qty", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal orderedQty = BigDecimal.ZERO;

    public BigDecimal getRemainingQty() {
        BigDecimal total = qty != null ? qty : BigDecimal.ZERO;
        BigDecimal ordered = orderedQty != null ? orderedQty : BigDecimal.ZERO;
        BigDecimal remaining = total.subtract(ordered);
        return remaining.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : remaining;
    }
}
