package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mrp_production_plan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionPlan {

    @Id
    @Column(name = "plan_id", nullable = false)
    private String planId;

    @Column(name = "posting_date", nullable = false)
    private LocalDate postingDate;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "plan_id")
    @Builder.Default
    private List<ProductionPlanItem> items = new ArrayList<>();
}
