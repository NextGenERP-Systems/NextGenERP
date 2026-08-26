package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "item_code", nullable = false, unique = true, length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "item_group", nullable = false, length = 100)
    @Builder.Default
    private String itemGroup = "Products";

    @Column(name = "stock_uom", nullable = false, length = 20)
    @Builder.Default
    private String stockUom = "Nos";

    @Column(name = "is_stock_item")
    @Builder.Default
    private Boolean isStockItem = true;

    @Column(name = "is_sales_item")
    @Builder.Default
    private Boolean isSalesItem = true;

    @Column(name = "standard_rate", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal standardRate = BigDecimal.ZERO;

    @Column(name = "last_purchase_rate", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal lastPurchaseRate = BigDecimal.ZERO;

    @Column(name = "valuation_rate", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal valuationRate = BigDecimal.ZERO;

    @Column(name = "max_discount", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal maxDiscount = new BigDecimal("20.00");

    @Column(name = "has_serial_no")
    @Builder.Default
    private Boolean hasSerialNo = false;

    @Column(name = "has_batch_no")
    @Builder.Default
    private Boolean hasBatchNo = false;

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
