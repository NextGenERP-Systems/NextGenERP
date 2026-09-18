package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "mrp_production_plan_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionPlanItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "plan_id", nullable = false)
    private String planId;

    @Column(name = "item_code", nullable = false)
    private String itemCode;

    @Column(name = "bom_no", nullable = false)
    private String bomNo;

    @Column(name = "planned_qty", nullable = false, precision = 15, scale = 4)
    private BigDecimal plannedQty;

    @Column(name = "produced_qty", nullable = false, precision = 15, scale = 4)
    private BigDecimal producedQty;

    @Column(name = "sales_order_ref")
    private String salesOrderRef;
}
