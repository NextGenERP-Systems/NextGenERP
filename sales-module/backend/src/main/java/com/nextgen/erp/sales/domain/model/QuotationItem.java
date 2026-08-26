package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "quotation_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuotationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id", nullable = false)
    private Quotation quotation;

    @Column(nullable = false)
    private Integer idx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal qty = BigDecimal.ONE;

    @Column(name = "stock_uom", nullable = false, length = 20)
    @Builder.Default
    private String stockUom = "Nos";

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String uom = "Nos";

    @Column(name = "conversion_factor", precision = 10, scale = 4)
    @Builder.Default
    private BigDecimal conversionFactor = BigDecimal.ONE;

    @Column(name = "stock_qty", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal stockQty = BigDecimal.ONE;

    @Column(name = "price_list_rate", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal priceListRate = BigDecimal.ZERO;

    @Column(name = "base_price_list_rate", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal basePriceListRate = BigDecimal.ZERO;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal rate = BigDecimal.ZERO;

    @Column(name = "base_rate", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal baseRate = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "base_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal baseAmount = BigDecimal.ZERO;

    @Column(name = "net_rate", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal netRate = BigDecimal.ZERO;

    @Column(name = "net_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal netAmount = BigDecimal.ZERO;

    @Column(name = "base_net_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal baseNetAmount = BigDecimal.ZERO;

    @Column(name = "valuation_rate", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal valuationRate = BigDecimal.ZERO;

    @Column(name = "gross_profit", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal grossProfit = BigDecimal.ZERO;

    @Column(name = "ordered_qty", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal orderedQty = BigDecimal.ZERO;
}
