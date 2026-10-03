package com.nextgen.erp.crm.presentation.controller;

import com.nextgen.erp.crm.domain.model.*;
import com.nextgen.erp.crm.dto.*;
import com.nextgen.erp.crm.service.CrmCompetitorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/crm") @RequiredArgsConstructor
public class CrmCompetitorController {
    private final CrmCompetitorService service;
    @GetMapping("/competitors") public List<CrmCompetitor> list(){return service.list();}
    @GetMapping("/competitors/{id}") public CrmCompetitor get(@PathVariable UUID id){return service.get(id);}
    @PostMapping("/competitors") @ResponseStatus(HttpStatus.CREATED) public CrmCompetitor create(@Valid @RequestBody CrmCompetitorRequest r){return service.create(r);}
    @PutMapping("/competitors/{id}") public CrmCompetitor update(@PathVariable UUID id,@Valid @RequestBody CrmCompetitorRequest r){return service.update(id,r);}
    @DeleteMapping("/competitors/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable UUID id){service.delete(id);}
    @GetMapping("/opportunities/{id}/competitors") public List<CrmOpportunityCompetitorView> links(@PathVariable UUID id){return service.forOpportunity(id);}
    @PostMapping("/opportunities/{id}/competitors") @ResponseStatus(HttpStatus.CREATED) public CrmOpportunityCompetitorView add(@PathVariable UUID id,@Valid @RequestBody CrmOpportunityCompetitorRequest r){return service.add(id,r);}
    @PutMapping("/opportunities/{id}/competitors/{competitorId}") public CrmOpportunityCompetitorView update(@PathVariable UUID id,@PathVariable UUID competitorId,@Valid @RequestBody CrmOpportunityCompetitorRequest r){return service.update(id,competitorId,r);}
    @DeleteMapping("/opportunities/{id}/competitors/{competitorId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void remove(@PathVariable UUID id,@PathVariable UUID competitorId){service.remove(id,competitorId);}
}
