package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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

    @Column(name = "source_mrp_run_id")
    private UUID sourceMrpRunId;

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

    public String getPlanId() { return planId; }
    public void setPlanId(String planId) { this.planId = planId; }

    public UUID getSourceMrpRunId() { return sourceMrpRunId; }
    public void setSourceMrpRunId(UUID sourceMrpRunId) { this.sourceMrpRunId = sourceMrpRunId; }

    public LocalDate getPostingDate() { return postingDate; }
    public void setPostingDate(LocalDate postingDate) { this.postingDate = postingDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }

    public List<ProductionPlanItem> getItems() { return items; }
    public void setItems(List<ProductionPlanItem> items) { this.items = items; }
}
