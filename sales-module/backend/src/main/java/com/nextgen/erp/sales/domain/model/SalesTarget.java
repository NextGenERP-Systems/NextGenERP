package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sales_targets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesTarget {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 50)
    private TargetType targetType;

    @Column(name = "target_ref_id", nullable = false)
    private UUID targetRefId;

    @Column(name = "target_ref_name", nullable = false, length = 150)
    private String targetRefName;

    @Column(name = "fiscal_year", nullable = false, length = 20)
    @Builder.Default
    private String fiscalYear = "2026";

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String period = "ANNUAL"; // MONTHLY, QUARTERLY, ANNUAL

    @Column(name = "item_group_id")
    private UUID itemGroupId;

    @Column(name = "item_group_name", length = 100)
    private String itemGroupName;

    @Column(name = "target_amount", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal targetAmount = BigDecimal.ZERO;

    @Column(name = "target_qty", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal targetQty = BigDecimal.ZERO;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @PrePersist
    public void onPrePersist() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    public void onPreUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
