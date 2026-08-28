package com.nextgen.erp.hrm.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "leave_allocations", uniqueConstraints = {
    @UniqueConstraint(name = "uq_emp_leave_year", columnNames = {"employee_id", "leave_type_id", "fiscal_year"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @Column(name = "fiscal_year", nullable = false)
    private Integer fiscalYear;

    @Column(name = "total_allocated", precision = 4, scale = 1, nullable = false)
    private BigDecimal totalAllocated;

    @Column(name = "used_leaves", precision = 4, scale = 1, nullable = false)
    @Builder.Default
    private BigDecimal usedLeaves = BigDecimal.ZERO;

    @Column(name = "pending_leaves", precision = 4, scale = 1, nullable = false)
    @Builder.Default
    private BigDecimal pendingLeaves = BigDecimal.ZERO;

    @Column(name = "remaining_leaves", precision = 4, scale = 1, nullable = false)
    private BigDecimal remainingLeaves;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
