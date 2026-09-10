package com.nextgen.erp.workflow.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "workflow_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    private Boolean enableEmailNotifications = true;

    @Builder.Default
    private Integer defaultAutoRejectionTimeoutDays = 7;

    @Builder.Default
    private Boolean strictMode = false;
}
