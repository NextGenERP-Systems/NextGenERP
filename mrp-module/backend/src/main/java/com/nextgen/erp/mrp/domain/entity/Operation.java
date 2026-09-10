package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mrp_operation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Operation {

    @Id
    @Column(name = "operation_id", length = 100)
    private String operationId;

    @Column(name = "operation_name", nullable = false)
    private String operationName;

    @Column(name = "default_workstation_id", length = 100)
    private String defaultWorkstationId;

    @Column(columnDefinition = "TEXT")
    private String description;
}
