package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "mrp_run")
@Getter
@Setter
@NoArgsConstructor
public class MrpRun {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID runId;

    @Column(name = "bom_no", nullable = false, length = 100)
    private String bomNo;

    @Column(name = "planned_qty", nullable = false, precision = 15, scale = 4)
    private BigDecimal plannedQty;

    @Column(name = "planning_date", nullable = false)
    private LocalDate planningDate;

    @Column(name = "calculation_cutoff_at", nullable = false)
    private ZonedDateTime calculationCutoffAt;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "CALCULATED";

    @Column(name = "created_at", nullable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
