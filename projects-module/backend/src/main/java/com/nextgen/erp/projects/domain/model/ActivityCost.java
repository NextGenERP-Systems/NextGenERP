package com.nextgen.erp.projects.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "activity_costs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityCost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_type_id", nullable = false)
    private ActivityType activityType;

    @Column(name = "employee_id")
    private UUID employeeId;

    @Column(name = "billing_rate", precision = 12, scale = 2)
    private BigDecimal billingRate;

    @Column(name = "costing_rate", precision = 12, scale = 2)
    private BigDecimal costingRate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
