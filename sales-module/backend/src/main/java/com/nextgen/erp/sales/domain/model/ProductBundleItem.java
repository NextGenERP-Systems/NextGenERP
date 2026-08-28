package com.nextgen.erp.sales.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "product_bundle_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductBundleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bundle_id", nullable = false)
    @JsonIgnore
    private ProductBundle productBundle;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(name = "item_name", length = 255)
    private String itemName;

    @Column(precision = 12, scale = 4, nullable = false)
    @Builder.Default
    private BigDecimal qty = BigDecimal.ONE;

    @Column(length = 20)
    @Builder.Default
    private String uom = "Nos";

    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal rate = BigDecimal.ZERO;
}
