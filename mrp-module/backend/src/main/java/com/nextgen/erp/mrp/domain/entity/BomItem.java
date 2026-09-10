package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "mrp_bom_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BomItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bom_no", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Bom bom;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal qty;

    @Column(length = 20)
    private String uom;

    @Column(name = "standard_rate", precision = 15, scale = 4)
    private BigDecimal standardRate;

    @Column(precision = 15, scale = 4)
    private BigDecimal amount;

    @Column(name = "sub_bom_no", length = 100)
    private String subBomNo;
}
