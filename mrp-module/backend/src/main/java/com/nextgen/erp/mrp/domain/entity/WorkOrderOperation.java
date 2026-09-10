package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "mrp_work_order_operation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @Column(name = "sequence_no", nullable = false)
    private Integer sequenceNo;

    @Column(name = "operation_id", nullable = false, length = 100)
    private String operationId;

    @Column(name = "workstation_id", nullable = false, length = 100)
    private String workstationId;

    @Column(name = "time_in_mins", precision = 10, scale = 2)
    private BigDecimal timeInMins;

    @Column(name = "completed_qty", precision = 15, scale = 4)
    private BigDecimal completedQty;

    @Column(name = "status", nullable = false, length = 50)
    private String status;
}
