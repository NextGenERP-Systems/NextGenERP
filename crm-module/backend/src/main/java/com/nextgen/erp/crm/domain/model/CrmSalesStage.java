package com.nextgen.erp.crm.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "crm_sales_stages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmSalesStage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "sequence_order", nullable = false)
    private Integer sequenceOrder;

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal probability = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @Column(name = "created_by", length = 100)
    @Builder.Default
    private String createdBy = "system";

    @Version
    private Integer version;
}
