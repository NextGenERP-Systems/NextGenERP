package com.nextgen.erp.hrm.domain.model;

import com.nextgen.erp.hrm.domain.model.Enums.AppraisalStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "employee_appraisals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeAppraisal {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "appraisal_cycle", nullable = false, length = 100)
    private String appraisalCycle;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "manager_id", nullable = false)
    private Employee manager;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "template_id", nullable = true)
    private AppraisalTemplate template;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private AppraisalStatus status = AppraisalStatus.DRAFT;

    @Column(name = "self_score", precision = 3, scale = 2)
    private BigDecimal selfScore;

    @Column(name = "manager_score", precision = 3, scale = 2)
    private BigDecimal managerScore;

    @Column(name = "final_score", precision = 3, scale = 2)
    private BigDecimal finalScore;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "promotion_recommended")
    @Builder.Default
    private Boolean promotionRecommended = false;

    @Column(name = "increment_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal incrementPercentage = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
