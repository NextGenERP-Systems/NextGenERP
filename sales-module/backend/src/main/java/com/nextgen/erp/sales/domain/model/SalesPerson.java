package com.nextgen.erp.sales.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sales_persons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesPerson {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sales_person_name", nullable = false, unique = true, length = 150)
    private String salesPersonName;

    @Column(name = "employee_id", length = 50)
    private String employeeId;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "parent_sales_person", length = 150)
    private String parentSalesPerson;

    @Column(name = "commission_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal commissionRate = new BigDecimal("4.50");

    @Column(name = "target_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal targetAmount = new BigDecimal("500000.00");

    @Column(name = "allocated_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal allocatedAmount = BigDecimal.ZERO;

    @Column(name = "incentives_earned", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal incentivesEarned = BigDecimal.ZERO;

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
