package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pricing_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "apply_on", nullable = false, length = 50)
    private PricingRuleApplyOn applyOn;

    @Column(name = "apply_key_id", nullable = false, length = 150)
    private String applyKeyId;

    @Column(name = "min_qty", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal minQty = BigDecimal.ONE;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "is_free_item")
    @Builder.Default
    private boolean isFreeItem = false;

    @Column(name = "free_item_code", length = 100)
    private String freeItemCode;

    @Column(name = "free_qty", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal freeQty = BigDecimal.ZERO;

    @Column(name = "valid_from")
    @Builder.Default
    private LocalDate validFrom = LocalDate.now();

    @Column(name = "valid_upto")
    private LocalDate validUpto;

    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
