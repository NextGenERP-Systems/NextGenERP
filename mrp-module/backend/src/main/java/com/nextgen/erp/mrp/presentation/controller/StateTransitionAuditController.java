package com.nextgen.erp.mrp.presentation.controller;

import com.nextgen.erp.mrp.application.service.StateTransitionAuditService;
import com.nextgen.erp.mrp.domain.entity.StateTransitionAudit;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mrp/state-audit")
@RequiredArgsConstructor
public class StateTransitionAuditController {
    private final StateTransitionAuditService service;

    @GetMapping("/{entityType}/{entityId}")
    public ResponseEntity<List<StateTransitionAudit>> getHistory(
            @PathVariable String entityType, @PathVariable String entityId) {
        return ResponseEntity.ok(service.getHistory(entityType, entityId));
    }
}
