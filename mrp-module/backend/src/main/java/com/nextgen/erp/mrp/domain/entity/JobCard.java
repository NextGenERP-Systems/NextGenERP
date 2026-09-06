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

    @Column(name = "total_time_in_mins", precision = 10, scale = 2)
    private BigDecimal totalTimeInMins;

    @Version
    private Integer version;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "job_card_id")
    @Builder.Default
    private List<JobCardTimeLog> timeLogs = new ArrayList<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;
}
