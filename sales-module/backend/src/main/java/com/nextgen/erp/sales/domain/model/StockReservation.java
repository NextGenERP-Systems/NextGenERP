package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_order_id", nullable = false)
    private SalesOrder salesOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_order_item_id", nullable = false)
    private SalesOrderItem salesOrderItem;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(nullable = false, length = 100)
    private String warehouse;

    @Column(name = "reserved_qty", nullable = false, precision = 15, scale = 4)
    private BigDecimal reservedQty;

    @Column(name = "delivered_qty", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal deliveredQty = BigDecimal.ZERO;

    @Column(length = 50)
    @Builder.Default
    private String status = "Reserved";

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
