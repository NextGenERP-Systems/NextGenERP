package com.nextgen.erp.mrp.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "mrp_state_transition_audit")
@Getter
@Setter
@NoArgsConstructor
public class StateTransitionAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @Column(name = "entity_type", nullable = false)
    private String entityType;
    @Column(name = "entity_id", nullable = false)
    private String entityId;
    @Column(name = "from_status")
    private String fromStatus;
    @Column(name = "to_status", nullable = false)
    private String toStatus;
    @Column(name = "action", nullable = false)
    private String action;
    @Column(name = "created_at", nullable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
