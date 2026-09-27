package com.nextgen.erp.sales.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "purchase_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    @JsonIgnore
    private PurchaseOrder purchaseOrder;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "qty", precision = 15, scale = 4, nullable = false)
    @Builder.Default
    private BigDecimal qty = BigDecimal.ONE;

    @Column(name = "received_qty", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal receivedQty = BigDecimal.ZERO;

    @Column(name = "billed_qty", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal billedQty = BigDecimal.ZERO;

    @Column(name = "uom", length = 30)
    @Builder.Default
    private String uom = "Nos";

    @Column(name = "rate", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal rate = BigDecimal.ZERO;

    @Column(name = "amount", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "target_warehouse", length = 100)
    @Builder.Default
    private String targetWarehouse = "Stores - Primary";
}
