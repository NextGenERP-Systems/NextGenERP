package com.nextgen.erp.crm.presentation.controller;

import com.nextgen.erp.crm.domain.model.CrmLeadHistory;
import com.nextgen.erp.crm.domain.model.CrmOpportunityHistory;
import com.nextgen.erp.crm.dto.CrmPageResponse;
import com.nextgen.erp.crm.repository.CrmLeadHistoryRepository;
import com.nextgen.erp.crm.repository.CrmLeadRepository;
import com.nextgen.erp.crm.repository.CrmOpportunityHistoryRepository;
import com.nextgen.erp.crm.repository.CrmOpportunityRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm")
public class CrmHistoryController {
 private final CrmLeadHistoryRepository leadHistory;
 private final CrmOpportunityHistoryRepository opportunityHistory;
 private final CrmLeadRepository leads;
 private final CrmOpportunityRepository opportunities;
 public CrmHistoryController(CrmLeadHistoryRepository leadHistory,CrmOpportunityHistoryRepository opportunityHistory,CrmLeadRepository leads,CrmOpportunityRepository opportunities){this.leadHistory=leadHistory;this.opportunityHistory=opportunityHistory;this.leads=leads;this.opportunities=opportunities;}
 @GetMapping("/leads/{id}/history") public CrmPageResponse<CrmLeadHistory> leadHistory(@PathVariable UUID id,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){validate(page,size);if(!leads.existsById(id))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Lead not found");return CrmPageResponse.from(leadHistory.findByLeadIdOrderByOccurredAtDescIdDesc(id,PageRequest.of(page,size)));}
 @GetMapping("/opportunities/{id}/history") public CrmPageResponse<CrmOpportunityHistory> opportunityHistory(@PathVariable UUID id,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){validate(page,size);if(!opportunities.existsById(id))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Opportunity not found");return CrmPageResponse.from(opportunityHistory.findByOpportunityIdOrderByOccurredAtDescIdDesc(id,PageRequest.of(page,size)));}
 private void validate(int page,int size){if(page<0||size<1||size>100)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"page must be nonnegative and size must be between 1 and 100");}
}
