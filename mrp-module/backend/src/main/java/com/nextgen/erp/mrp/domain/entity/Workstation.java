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
}
