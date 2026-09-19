package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "mrp_job_card_time_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCardTimeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "job_card_id", nullable = false, length = 100)
    private String jobCardId;

    @Column(name = "employee_id", length = 100)
    private String employeeId;

    @Column(name = "start_time", nullable = false)
    private ZonedDateTime startTime;

    @Column(name = "end_time")
    private ZonedDateTime endTime;

    @Column(name = "time_in_mins", precision = 10, scale = 2)
    private BigDecimal timeInMins;

    @Column(name = "completed_qty", precision = 15, scale = 4)
    private BigDecimal completedQty;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getJobCardId() { return jobCardId; }
    public void setJobCardId(String jobCardId) { this.jobCardId = jobCardId; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public ZonedDateTime getStartTime() { return startTime; }
    public void setStartTime(ZonedDateTime startTime) { this.startTime = startTime; }

    public ZonedDateTime getEndTime() { return endTime; }
    public void setEndTime(ZonedDateTime endTime) { this.endTime = endTime; }

    public BigDecimal getTimeInMins() { return timeInMins; }
    public void setTimeInMins(BigDecimal timeInMins) { this.timeInMins = timeInMins; }

    public BigDecimal getCompletedQty() { return completedQty; }
    public void setCompletedQty(BigDecimal completedQty) { this.completedQty = completedQty; }
}
