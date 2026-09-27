package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "mrp_downtime_entry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DowntimeEntry {

    @Id
    @Column(name = "downtime_id", nullable = false)
    private String downtimeId;

    @Column(name = "workstation_id", nullable = false)
    private String workstationId;

    @Column(name = "operator_employee_id")
    private String operatorEmployeeId;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "start_time", nullable = false)
    private ZonedDateTime startTime;

    @Column(name = "end_time")
    private ZonedDateTime endTime;

    @Column(name = "downtime_in_mins", precision = 10, scale = 2)
    private BigDecimal downtimeInMins;

    @Column(name = "remarks")
    private String remarks;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    public String getDowntimeId() { return downtimeId; }
    public void setDowntimeId(String downtimeId) { this.downtimeId = downtimeId; }

    public String getWorkstationId() { return workstationId; }
    public void setWorkstationId(String workstationId) { this.workstationId = workstationId; }

    public String getOperatorEmployeeId() { return operatorEmployeeId; }
    public void setOperatorEmployeeId(String operatorEmployeeId) { this.operatorEmployeeId = operatorEmployeeId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public ZonedDateTime getStartTime() { return startTime; }
    public void setStartTime(ZonedDateTime startTime) { this.startTime = startTime; }

    public ZonedDateTime getEndTime() { return endTime; }
    public void setEndTime(ZonedDateTime endTime) { this.endTime = endTime; }

    public BigDecimal getDowntimeInMins() { return downtimeInMins; }
    public void setDowntimeInMins(BigDecimal downtimeInMins) { this.downtimeInMins = downtimeInMins; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
