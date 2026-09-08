package com.nextgen.erp.crm.presentation.controller;

import com.nextgen.erp.crm.domain.model.CrmOpportunity;
import com.nextgen.erp.crm.dto.CrmOpportunityRequest;
import com.nextgen.erp.crm.service.CrmOpportunityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm/opportunities")
public class CrmOpportunityController {

    private final CrmOpportunityService opportunityService;

    public CrmOpportunityController(CrmOpportunityService opportunityService) {
        this.opportunityService = opportunityService;
    }

    @GetMapping
    public ResponseEntity<List<CrmOpportunity>> getAllOpportunities() {
        return ResponseEntity.ok(opportunityService.getAllOpportunities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CrmOpportunity> getOpportunityById(@PathVariable UUID id) {
        return ResponseEntity.ok(opportunityService.getOpportunityById(id));
    }

    @PostMapping
    public ResponseEntity<CrmOpportunity> createOpportunity(@RequestBody CrmOpportunityRequest request) {
        return new ResponseEntity<>(opportunityService.createOpportunity(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CrmOpportunity> updateOpportunity(@PathVariable UUID id, @RequestBody CrmOpportunityRequest request) {
        return ResponseEntity.ok(opportunityService.updateOpportunity(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOpportunity(@PathVariable UUID id) {
        opportunityService.deleteOpportunity(id);
        return ResponseEntity.noContent().build();
    }
}
