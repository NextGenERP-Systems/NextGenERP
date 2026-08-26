package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "sales_teams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesTeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "voucher_type", nullable = false, length = 50)
    private String voucherType;

    @Column(name = "voucher_id", nullable = false)
    private UUID voucherId;

    @Column(name = "sales_person_name", nullable = false, length = 100)
    private String salesPersonName;

    @Column(name = "allocated_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal allocatedPercentage;

    @Column(name = "allocated_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal allocatedAmount = BigDecimal.ZERO;

    @Column(name = "commission_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal commissionRate = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal incentives = BigDecimal.ZERO;
}
