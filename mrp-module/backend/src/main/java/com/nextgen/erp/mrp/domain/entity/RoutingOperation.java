package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "mrp_routing_operation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoutingOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routing_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Routing routing;

    @Column(name = "sequence_no", nullable = false)
    private Integer sequenceNo;

    @Column(name = "operation_id", nullable = false, length = 100)
    private String operationId;

    @Column(name = "workstation_id", nullable = false, length = 100)
    private String workstationId;

    @Column(name = "time_in_mins", precision = 10, scale = 2)
    private BigDecimal timeInMins;

    @Column(name = "batch_size")
    @Builder.Default
    private Integer batchSize = 1;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Routing getRouting() { return routing; }
    public void setRouting(Routing routing) { this.routing = routing; }

    public Integer getSequenceNo() { return sequenceNo; }
    public void setSequenceNo(Integer sequenceNo) { this.sequenceNo = sequenceNo; }

    public String getOperationId() { return operationId; }
    public void setOperationId(String operationId) { this.operationId = operationId; }

    public String getWorkstationId() { return workstationId; }
    public void setWorkstationId(String workstationId) { this.workstationId = workstationId; }

    public BigDecimal getTimeInMins() { return timeInMins; }
    public void setTimeInMins(BigDecimal timeInMins) { this.timeInMins = timeInMins; }

    public Integer getBatchSize() { return batchSize; }
    public void setBatchSize(Integer batchSize) { this.batchSize = batchSize; }
}
