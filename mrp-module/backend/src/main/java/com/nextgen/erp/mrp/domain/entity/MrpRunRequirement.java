package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "mrp_run_requirement")
@Getter
@Setter
@NoArgsConstructor
public class MrpRunRequirement {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "run_id", nullable = false)
    private UUID runId;

    @Column(name = "item_code", nullable = false, length = 100)
    private String itemCode;

    @Column(name = "required_qty", nullable = false, precision = 15, scale = 4)
    private BigDecimal requiredQty;

    @Column(name = "stock_qty", nullable = false, precision = 15, scale = 4)
    private BigDecimal stockQty;

    @Column(name = "shortage_qty", nullable = false, precision = 15, scale = 4)
    private BigDecimal shortageQty;

    @Column(name = "recommended_action", nullable = false, length = 50)
    private String recommendedAction;
}
