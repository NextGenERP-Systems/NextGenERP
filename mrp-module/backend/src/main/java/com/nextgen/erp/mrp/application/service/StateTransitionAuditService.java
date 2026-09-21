package com.nextgen.erp.mrp.application.service;

import com.nextgen.erp.mrp.domain.entity.StateTransitionAudit;
import com.nextgen.erp.mrp.domain.repository.StateTransitionAuditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StateTransitionAuditService {
    private final StateTransitionAuditRepository repository;

    @Transactional(readOnly = true)
    public List<StateTransitionAudit> getHistory(String entityType, String entityId) {
        if (entityType == null || entityType.isBlank() || entityId == null || entityId.isBlank()) {
            throw new IllegalArgumentException("Entity type and entity ID are required");
        }
        return repository.findByEntityTypeAndEntityIdOrderByCreatedAtAsc(
                entityType.trim().toUpperCase(), entityId.trim());
    }
}
