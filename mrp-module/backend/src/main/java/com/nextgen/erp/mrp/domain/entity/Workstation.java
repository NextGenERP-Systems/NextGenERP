package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "mrp_workstation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workstation {

    @Id
    @Column(name = "workstation_id", length = 100)
    private String workstationId;

    @Column(name = "workstation_name", nullable = false)
    private String workstationName;

    @Column(name = "hourly_cost", precision = 15, scale = 4)
    private BigDecimal hourlyCost;

    @Column(name = "electricity_cost_per_hour", precision = 15, scale = 4)
    private BigDecimal electricityCostPerHour;

    @Column(name = "working_hours_per_day", precision = 5, scale = 2)
    private BigDecimal workingHoursPerDay;

    @Column(columnDefinition = "TEXT")
    private String description;

    public String getWorkstationId() { return workstationId; }
    public void setWorkstationId(String workstationId) { this.workstationId = workstationId; }

    public String getWorkstationName() { return workstationName; }
    public void setWorkstationName(String workstationName) { this.workstationName = workstationName; }

    public BigDecimal getHourlyCost() { return hourlyCost; }
    public void setHourlyCost(BigDecimal hourlyCost) { this.hourlyCost = hourlyCost; }

    public BigDecimal getElectricityCostPerHour() { return electricityCostPerHour; }
    public void setElectricityCostPerHour(BigDecimal electricityCostPerHour) { this.electricityCostPerHour = electricityCostPerHour; }

    public BigDecimal getWorkingHoursPerDay() { return workingHoursPerDay; }
    public void setWorkingHoursPerDay(BigDecimal workingHoursPerDay) { this.workingHoursPerDay = workingHoursPerDay; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
