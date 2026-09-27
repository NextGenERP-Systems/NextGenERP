package com.nextgen.erp.mrp.domain.repository;

import com.nextgen.erp.mrp.domain.entity.StateTransitionAudit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;

public interface StateTransitionAuditRepository extends JpaRepository<StateTransitionAudit, UUID> {
    List<StateTransitionAudit> findByEntityTypeAndEntityIdOrderByCreatedAtAsc(String entityType, String entityId);
}
