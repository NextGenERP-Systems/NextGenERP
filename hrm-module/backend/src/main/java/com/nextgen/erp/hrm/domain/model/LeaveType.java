package com.nextgen.erp.hrm.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "leave_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveType {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "leave_type_code", unique = true, nullable = false, length = 30)
    private String leaveTypeCode;

    @Column(name = "leave_type_name", nullable = false, length = 100)
    private String leaveTypeName;

    @Column(name = "max_days_allowed", nullable = false)
    @Builder.Default
    private Integer maxDaysAllowed = 12;

    @Column(name = "is_carry_forward", nullable = false)
    @Builder.Default
    private Boolean isCarryForward = false;

    @Column(name = "max_carry_forward_days")
    @Builder.Default
    private Integer maxCarryForwardDays = 0;

    @Column(name = "is_lwp", nullable = false)
    @Builder.Default
    private Boolean isLwp = false;

    @Column(name = "is_encashable", nullable = false)
    @Builder.Default
    private Boolean isEncashable = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
