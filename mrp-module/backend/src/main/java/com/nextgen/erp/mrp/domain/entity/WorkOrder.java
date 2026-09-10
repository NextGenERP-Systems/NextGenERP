package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mrp_work_order")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrder {

    @Id
    @Column(name = "work_order_id", length = 100)
    private String workOrderId;

    @Column(name = "parent_wo_id", length = 100)
    private String parentWoId;

    @Column(name = "production_item", nullable = false, length = 100)
    private String productionItem;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "bom_no", nullable = false, length = 100)
    private String bomNo;

    @Column(name = "qty_to_produce", nullable = false, precision = 15, scale = 4)
    private BigDecimal qtyToProduce;

    @Column(name = "produced_qty", precision = 15, scale = 4)
    private BigDecimal producedQty;

    @Column(name = "source_warehouse", length = 100)
    private String sourceWarehouse;

    @Column(name = "wip_warehouse", length = 100)
    private String wipWarehouse;

    @Column(name = "fg_warehouse", length = 100)
    private String fgWarehouse;

    @Column(name = "planned_start_date", nullable = false)
    private ZonedDateTime plannedStartDate;

    @Column(name = "planned_end_date", nullable = false)
    private ZonedDateTime plannedEndDate;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "planned_material_cost", precision = 15, scale = 4)
    private BigDecimal plannedMaterialCost;

    @Column(name = "actual_material_cost", precision = 15, scale = 4)
    private BigDecimal actualMaterialCost;

    @Column(name = "planned_operating_cost", precision = 15, scale = 4)
    private BigDecimal plannedOperatingCost;

    @Column(name = "actual_operating_cost", precision = 15, scale = 4)
    private BigDecimal actualOperatingCost;

    @Version
    private Integer version;

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkOrderItem> items = new ArrayList<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;
}
