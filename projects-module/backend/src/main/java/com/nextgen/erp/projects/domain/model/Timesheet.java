package com.nextgen.erp.projects.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "timesheets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Timesheet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Project project;

    @com.fasterxml.jackson.annotation.JsonProperty("projectId")
    @Transient
    public UUID getProjectId() {
        return project != null ? project.getId() : null;
    }

    @Column(nullable = false)
    @Builder.Default
    private String status = "Draft"; // Draft, Submitted, Billed

    @Column(name = "total_hours")
    @Builder.Default
    private BigDecimal totalHours = BigDecimal.ZERO;

    @Column(name = "total_billable_hours")
    @Builder.Default
    private BigDecimal totalBillableHours = BigDecimal.ZERO;

    @Column(name = "total_billed_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalBilledAmount = BigDecimal.ZERO;

    @Column(name = "total_costing_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalCostingAmount = BigDecimal.ZERO;

    @OneToMany(mappedBy = "timesheet", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private List<TimesheetDetail> timeLogs = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public void addTimeLog(TimesheetDetail log) {
        timeLogs.add(log);
        log.setTimesheet(this);
    }
    
    public void removeTimeLog(TimesheetDetail log) {
        timeLogs.remove(log);
        log.setTimesheet(null);
    }
}
