package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mrp_bom")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bom {

    @Id
    @Column(name = "bom_no", length = 100)
    private String bomNo;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal quantity;

    @Column(length = 20)
    private String uom;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    @Column(name = "routing_id", length = 100)
    private String routingId;

    @Column(name = "raw_material_cost", precision = 15, scale = 4)
    private BigDecimal rawMaterialCost;

    @Column(name = "operating_cost", precision = 15, scale = 4)
    private BigDecimal operatingCost;

    @Column(name = "scrap_cost", precision = 15, scale = 4)
    private BigDecimal scrapCost;

    @Column(name = "total_cost", precision = 15, scale = 4)
    private BigDecimal totalCost;

    @OneToMany(mappedBy = "bom", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BomItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "bom", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BomOperation> operations = new ArrayList<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;
}
