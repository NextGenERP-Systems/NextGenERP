package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "mrp_bom_secondary_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BomSecondaryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "bom_no", nullable = false, length = 100)
    private String bomNo;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal qty;

    @Column(length = 20)
    private String uom;

    @Column(name = "valuation_rate", precision = 15, scale = 4)
    private BigDecimal valuationRate;
}
