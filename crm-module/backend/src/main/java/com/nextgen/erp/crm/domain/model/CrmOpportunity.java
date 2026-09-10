package com.nextgen.erp.crm.domain.model;

import com.nextgen.erp.crm.domain.enums.CrmOpportunityStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "crm_opportunities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmOpportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "opportunity_name", nullable = false)
    private String opportunityName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prospect_id")
    private CrmProspect prospect;

    @Column(name = "customer_id")
    private UUID customerId;

    private BigDecimal amount;

    @Column(name = "expected_close_date")
    private LocalDate expectedCloseDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_stage_id")
    private CrmSalesStage salesStage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_type_id")
    private CrmOpportunityType opportunityType;

    private Integer probability;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CrmOpportunityStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lost_reason_id")
    private CrmLostReason lostReason;

    @Column(name = "assigned_to")
    private UUID assignedTo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = CrmOpportunityStatus.OPEN;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
