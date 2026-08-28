package com.nextgen.erp.workflow.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "workflow_transitions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTransition {

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

    @Column(name = "from_state_id", nullable = false)
    private UUID fromStateId;

    @Column(name = "to_state_id", nullable = false)
    private UUID toStateId;

    @Column(name = "action_name", nullable = false)
    private String actionName;

    @Column(name = "allowed_role", nullable = false)
    private String allowedRole;

    @Column(name = "condition_expression")
    private String conditionExpression;

    @Column(name = "allow_self_approval")
    private Boolean allowSelfApproval;

    @Column(name = "send_email_to_creator")
    private Boolean sendEmailToCreator;
}
