package com.nextgen.erp.hrm.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "shift_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftType {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "shift_name", unique = true, nullable = false, length = 100)
    private String shiftName;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "late_entry_grace_minutes")
    @Builder.Default
    private Integer lateEntryGraceMinutes = 15;

    @Column(name = "early_exit_grace_minutes")
    @Builder.Default
    private Integer earlyExitGraceMinutes = 15;

    @Column(name = "working_hours", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal workingHours = BigDecimal.valueOf(8.00);

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
