package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mrp_job_card")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCard {

    @Id
    @Column(name = "job_card_id", length = 100)
    private String jobCardId;

    @Column(name = "work_order_id", nullable = false, length = 100)
    private String workOrderId;

    @Column(name = "operation_id", nullable = false, length = 100)
    private String operationId;

    @Column(name = "workstation_id", nullable = false, length = 100)
    private String workstationId;

    @Column(name = "for_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal forQuantity;

    @Column(name = "completed_quantity", precision = 15, scale = 4)
    private BigDecimal completedQuantity;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "assigned_employee_id", length = 100)
    private String assignedEmployeeId;

    @Column(name = "scheduled_start_time")
    private ZonedDateTime scheduledStartTime;

    @Column(name = "scheduled_end_time")
    private ZonedDateTime scheduledEndTime;

    @Column(name = "total_time_in_mins", precision = 10, scale = 2)
    private BigDecimal totalTimeInMins;

    @Column(name = "scrap_quantity", precision = 15, scale = 4)
    private BigDecimal scrapQuantity;

    @Column(name = "scrap_reason")
    private String scrapReason;

    @Version
    private Integer version;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "job_card_id")
    @Builder.Default
    private List<JobCardTimeLog> timeLogs = new ArrayList<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;

    public String getJobCardId() { return jobCardId; }
    public void setJobCardId(String jobCardId) { this.jobCardId = jobCardId; }

    public String getWorkOrderId() { return workOrderId; }
    public void setWorkOrderId(String workOrderId) { this.workOrderId = workOrderId; }

    public String getOperationId() { return operationId; }
    public void setOperationId(String operationId) { this.operationId = operationId; }

    public String getWorkstationId() { return workstationId; }
    public void setWorkstationId(String workstationId) { this.workstationId = workstationId; }

    public BigDecimal getForQuantity() { return forQuantity; }
    public void setForQuantity(BigDecimal forQuantity) { this.forQuantity = forQuantity; }

    public BigDecimal getCompletedQuantity() { return completedQuantity; }
    public void setCompletedQuantity(BigDecimal completedQuantity) { this.completedQuantity = completedQuantity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedEmployeeId() { return assignedEmployeeId; }
    public void setAssignedEmployeeId(String assignedEmployeeId) { this.assignedEmployeeId = assignedEmployeeId; }

    public ZonedDateTime getScheduledStartTime() { return scheduledStartTime; }
    public void setScheduledStartTime(ZonedDateTime scheduledStartTime) { this.scheduledStartTime = scheduledStartTime; }

    public ZonedDateTime getScheduledEndTime() { return scheduledEndTime; }
    public void setScheduledEndTime(ZonedDateTime scheduledEndTime) { this.scheduledEndTime = scheduledEndTime; }

    public BigDecimal getTotalTimeInMins() { return totalTimeInMins; }
    public void setTotalTimeInMins(BigDecimal totalTimeInMins) { this.totalTimeInMins = totalTimeInMins; }

    public BigDecimal getScrapQuantity() { return scrapQuantity; }
    public void setScrapQuantity(BigDecimal scrapQuantity) { this.scrapQuantity = scrapQuantity; }

    public String getScrapReason() { return scrapReason; }
    public void setScrapReason(String scrapReason) { this.scrapReason = scrapReason; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public List<JobCardTimeLog> getTimeLogs() { return timeLogs; }
    public void setTimeLogs(List<JobCardTimeLog> timeLogs) { this.timeLogs = timeLogs; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
