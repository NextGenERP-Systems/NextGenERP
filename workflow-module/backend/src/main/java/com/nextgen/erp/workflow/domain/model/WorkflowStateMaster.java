package com.nextgen.erp.workflow.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "workflow_state_master")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStateMaster {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
        name = "UUID",
        strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "state_name", nullable = false, unique = true)
    private String stateName;

    @Column(name = "color_code")
    private String colorCode;

    @Column(name = "description")
    private String description;
}
