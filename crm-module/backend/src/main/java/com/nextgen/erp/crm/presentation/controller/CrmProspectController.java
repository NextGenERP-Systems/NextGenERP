package com.nextgen.erp.crm.presentation.controller;

import com.nextgen.erp.crm.domain.model.CrmProspect;
import com.nextgen.erp.crm.dto.CrmProspectRequest;
import com.nextgen.erp.crm.service.CrmProspectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm/prospects")
public class CrmProspectController {

    private final CrmProspectService prospectService;

    public CrmProspectController(CrmProspectService prospectService) {
        this.prospectService = prospectService;
    }

    @GetMapping
    public ResponseEntity<List<CrmProspect>> getAllProspects() {
        return ResponseEntity.ok(prospectService.getAllProspects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CrmProspect> getProspectById(@PathVariable UUID id) {
        return ResponseEntity.ok(prospectService.getProspectById(id));
    }

    @PostMapping
    public ResponseEntity<CrmProspect> createProspect(@RequestBody CrmProspectRequest request) {
        return new ResponseEntity<>(prospectService.createProspect(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CrmProspect> updateProspect(@PathVariable UUID id, @RequestBody CrmProspectRequest request) {
        return ResponseEntity.ok(prospectService.updateProspect(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProspect(@PathVariable UUID id) {
        prospectService.deleteProspect(id);
        return ResponseEntity.noContent().build();
    }
}
