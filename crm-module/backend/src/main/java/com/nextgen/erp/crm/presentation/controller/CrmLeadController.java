package com.nextgen.erp.crm.presentation.controller;

import com.nextgen.erp.crm.domain.model.CrmLead;
import com.nextgen.erp.crm.domain.model.CrmProspect;
import com.nextgen.erp.crm.dto.CrmLeadRequest;
import com.nextgen.erp.crm.service.CrmLeadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm/leads")
public class CrmLeadController {

    private final CrmLeadService leadService;

    public CrmLeadController(CrmLeadService leadService) {
        this.leadService = leadService;
    }

    @GetMapping
    public ResponseEntity<List<CrmLead>> getAllLeads() {
        return ResponseEntity.ok(leadService.getAllLeads());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CrmLead> getLeadById(@PathVariable UUID id) {
        return ResponseEntity.ok(leadService.getLeadById(id));
    }

    @PostMapping
    public ResponseEntity<CrmLead> createLead(@RequestBody CrmLeadRequest request) {
        return new ResponseEntity<>(leadService.createLead(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CrmLead> updateLead(@PathVariable UUID id, @RequestBody CrmLeadRequest request) {
        return ResponseEntity.ok(leadService.updateLead(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable UUID id) {
        leadService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/qualify")
    public ResponseEntity<CrmProspect> qualifyLead(@PathVariable UUID id) {
        return ResponseEntity.ok(leadService.qualifyLeadToProspect(id));
    }
}
