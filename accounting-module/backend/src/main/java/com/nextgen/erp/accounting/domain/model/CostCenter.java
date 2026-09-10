package com.nextgen.erp.accounting.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cost_centers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CostCenter {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "cost_center_code", unique = true, nullable = false, length = 50)
    private String costCenterCode;

    @Column(name = "cost_center_name", nullable = false, length = 150)
    private String costCenterName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_cost_center_id")
    private CostCenter parentCostCenter;

    @Column(name = "is_group")
    @Builder.Default
    private Boolean isGroup = false;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
