package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "shipping_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "shipping_rule_name", nullable = false, unique = true, length = 150)
    private String shippingRuleName;

    @Column(name = "calculate_based_on", nullable = false, length = 50)
    @Builder.Default
    private String calculateBasedOn = "Net Total"; // Fixed, Net Total, Net Weight

    @Column(name = "shipping_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal shippingAmount = BigDecimal.ZERO;

    @Column(name = "from_value", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal fromValue = BigDecimal.ZERO;

    @Column(name = "to_value", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal toValue = new BigDecimal("99999999");

    @Column(name = "cost_center", length = 100)
    private String costCenter;

    @Column(name = "disabled")
    @Builder.Default
    private Boolean disabled = false;

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
