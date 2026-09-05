package com.nextgen.erp.workflow.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import org.hibernate.annotations.JdbcTypeCode;
import java.util.UUID;

@Entity
@Table(name = "workflow_states")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowState {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
        name = "UUID",
        strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "workflow_id", nullable = false)
    private UUID workflowId;

    @Column(name = "state_name", nullable = false)
    private String stateName;

    @Column(name = "color_code")
    private String colorCode;

    @Column(name = "is_initial_state")
    private Boolean isInitialState;

    @Column(name = "is_final_state")
    private Boolean isFinalState;

    @JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "update_fields", columnDefinition = "jsonb")
    private java.util.Map<String, Object> updateFields;

    @Column(name = "allow_edit_role")
    private String allowEditRole;

    @Column(name = "send_email", nullable = false)
    private Boolean sendEmail = false;

    @Column(name = "is_optional_state")
    private Boolean isOptionalState;

    // SLA & Escalation
    @Column(name = "sla_days")
    private Integer slaDays;

    @Column(name = "escalation_role")
    private String escalationRole;

    @Column(name = "requires_all_roles")
    private Boolean requiresAllRoles = false;

    @Column(name = "required_roles")
    private String requiredRoles;
}
