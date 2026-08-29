package com.nextgen.erp.projects.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "timesheet_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TimesheetDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timesheet_id", nullable = false)
    @JsonIgnore
    private Timesheet timesheet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Task task;

    @com.fasterxml.jackson.annotation.JsonProperty("taskId")
    @Transient
    public UUID getTaskId() {
        return task != null ? task.getId() : null;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_type_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ActivityType activityType;

    @com.fasterxml.jackson.annotation.JsonProperty("activityTypeId")
    @Transient
    public UUID getActivityTypeId() {
        return activityType != null ? activityType.getId() : null;
    }

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "from_time")
    private LocalTime fromTime;

    @Column(name = "to_time")
    private LocalTime toTime;

    @Column(nullable = false)
    private BigDecimal hours;

    @Column(name = "is_billable", nullable = false)
    @Builder.Default
    private Boolean isBillable = false;

    @Column(name = "billing_rate", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal billingRate = BigDecimal.ZERO;

    @Column(name = "costing_rate", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal costingRate = BigDecimal.ZERO;

    @Column(name = "billing_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal billingAmount = BigDecimal.ZERO;

    @Column(name = "costing_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal costingAmount = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String description;
}
