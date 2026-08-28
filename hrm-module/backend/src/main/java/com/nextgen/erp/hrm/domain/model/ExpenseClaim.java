package com.nextgen.erp.hrm.domain.model;

import com.nextgen.erp.hrm.domain.model.Enums.ExpenseStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "expense_claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "claim_number", unique = true, nullable = false, length = 50)
    private String claimNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "claim_date", nullable = false)
    @Builder.Default
    private LocalDate claimDate = LocalDate.now();

    @Column(name = "expense_type", nullable = false, length = 100)
    private String expenseType;

    @Column(name = "total_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "sanctioned_amount", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal sanctionedAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ExpenseStatus status = ExpenseStatus.SUBMITTED;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id")
    private Employee approvedBy;

    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

    // Cross-Module Sales Integration
    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "customer_name", length = 255)
    private String customerName;

    @Column(name = "sales_order_id", length = 100)
    private String salesOrderId;

    @Column(name = "is_billable")
    @Builder.Default
    private Boolean isBillable = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
