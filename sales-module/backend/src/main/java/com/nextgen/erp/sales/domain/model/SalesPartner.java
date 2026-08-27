package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sales_partners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "partner_name", nullable = false, unique = true, length = 150)
    private String partnerName;

    @Column(name = "partner_type", nullable = false, length = 50)
    @Builder.Default
    private String partnerType = "Channel Partner";

    @Column(name = "commission_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal commissionRate = new BigDecimal("5.00");

    @Column(name = "currency", length = 3)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "contact_person", length = 100)
    private String contactPerson;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "territory", length = 100)
    @Builder.Default
    private String territory = "Global";

    @Column(name = "total_allocated_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalAllocatedAmount = BigDecimal.ZERO;

    @Column(name = "total_commission_earned", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalCommissionEarned = BigDecimal.ZERO;

    @Column(name = "disabled")
    @Builder.Default
    private Boolean disabled = false;

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}
