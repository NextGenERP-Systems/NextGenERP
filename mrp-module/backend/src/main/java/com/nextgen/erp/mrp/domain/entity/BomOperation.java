package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "mrp_bom_operation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BomOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bom_no", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Bom bom;

    @Column(name = "sequence_no", nullable = false)
    private Integer sequenceNo;

    @Column(name = "operation_id", nullable = false, length = 100)
    private String operationId;

    @Column(name = "workstation_id", nullable = false, length = 100)
    private String workstationId;

    @Column(name = "time_in_mins", precision = 10, scale = 2)
    private BigDecimal timeInMins;

    @Column(name = "operating_cost", precision = 15, scale = 4)
    private BigDecimal operatingCost;
}
