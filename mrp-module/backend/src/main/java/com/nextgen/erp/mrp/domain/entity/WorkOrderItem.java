package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "mrp_work_order_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private WorkOrder workOrder;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "required_qty", nullable = false, precision = 15, scale = 4)
    private BigDecimal requiredQty;

    @Column(name = "transferred_qty", precision = 15, scale = 4)
    private BigDecimal transferredQty;

    @Column(name = "actual_consumed_qty", precision = 15, scale = 4)
    private BigDecimal actualConsumedQty;

    @Column(length = 20)
    private String uom;

    @Column(name = "standard_rate", precision = 15, scale = 4)
    private BigDecimal standardRate;
}
